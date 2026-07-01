import { resolve } from "node:path";
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma";

config({ path: resolve(__dirname, "../../.env") });

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const SOURCE = "osm";

// OSM Brazil tags catholic churches as amenity=place_of_worship + religion=christian
// + denomination=catholic|roman_catholic (not religion=catholic, which is rarely used).
const DENOMINATION_FILTER = '["denomination"~"^(catholic|roman_catholic)$"]';
const OVERPASS_QUERY = `
[out:json][timeout:180];
area["ISO3166-1"="BR"][admin_level=2]->.br;
(
  node["amenity"="place_of_worship"]${DENOMINATION_FILTER}(area.br);
  way["amenity"="place_of_worship"]${DENOMINATION_FILTER}(area.br);
  relation["amenity"="place_of_worship"]${DENOMINATION_FILTER}(area.br);
);
out center tags;
`;

interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

interface NormalizedChurch {
  name: string;
  latitude: number;
  longitude: number;
  address: string | null;
  city: string | null;
  state: string | null;
  source: string;
}

function normalizeName(rawName: string): string {
  return rawName.replace(/\s+/g, " ").trim();
}

function buildAddress(tags: Record<string, string>): string | null {
  const street = tags["addr:street"];
  const houseNumber = tags["addr:housenumber"];
  if (!street) return null;
  return houseNumber ? `${street}, ${houseNumber}` : street;
}

function elementCoords(el: OverpassElement): { lat: number; lon: number } | null {
  if (typeof el.lat === "number" && typeof el.lon === "number") {
    return { lat: el.lat, lon: el.lon };
  }
  if (el.center) return el.center;
  return null;
}

const MAX_ATTEMPTS = 4;

async function fetchOverpassElements(): Promise<OverpassElement[]> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(OVERPASS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
          "User-Agent": "catholicae-osm-import/0.1 (https://github.com/joaovictormaria/catholicae)",
        },
        body: `data=${encodeURIComponent(OVERPASS_QUERY)}`,
      });

      if (!response.ok) {
        throw new Error(`Overpass API request failed: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as OverpassResponse;
      return data.elements;
    } catch (error) {
      lastError = error;
      console.warn(`Overpass request attempt ${attempt}/${MAX_ATTEMPTS} failed: ${error}`);
      if (attempt < MAX_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, attempt * 5000));
      }
    }
  }

  throw lastError;
}

function normalize(elements: OverpassElement[]): NormalizedChurch[] {
  const churches: NormalizedChurch[] = [];

  for (const el of elements) {
    const tags = el.tags ?? {};
    const rawName = tags.name ?? tags["name:pt"];
    if (!rawName) continue;

    const coords = elementCoords(el);
    if (!coords) continue;

    churches.push({
      name: normalizeName(rawName),
      latitude: coords.lat,
      longitude: coords.lon,
      address: buildAddress(tags),
      city: tags["addr:city"] ?? null,
      state: tags["addr:state"] ?? null,
      source: SOURCE,
    });
  }

  return churches;
}

function dedupe(churches: NormalizedChurch[]): NormalizedChurch[] {
  const seen = new Map<string, NormalizedChurch>();

  for (const church of churches) {
    const key = [
      church.name.toLowerCase(),
      church.latitude.toFixed(3),
      church.longitude.toFixed(3),
    ].join("|");

    if (!seen.has(key)) seen.set(key, church);
  }

  return [...seen.values()];
}

async function main() {
  console.log("Fetching catholic churches from OpenStreetMap (Overpass API)...");
  const elements = await fetchOverpassElements();
  console.log(`Fetched ${elements.length} raw elements.`);

  const normalized = normalize(elements);
  console.log(`Normalized ${normalized.length} elements with a usable name and coordinates.`);

  const deduped = dedupe(normalized);
  console.log(`Deduplicated down to ${deduped.length} unique churches.`);

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });
  try {
    await prisma.church.deleteMany({ where: { source: SOURCE } });
    const result = await prisma.church.createMany({ data: deduped });
    console.log(`Inserted ${result.count} churches from source "${SOURCE}".`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Failed to import churches from OSM:", error);
  process.exitCode = 1;
});
