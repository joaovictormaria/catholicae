import { resolve } from "node:path";
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma";

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
  phone: string | null;
  openingHours: string | null;
  source: string;
}

const PLACEHOLDER_NAMES = new Set(["", "-", "n/a", "na", "sem nome", "unnamed", "test", "teste"]);

function normalizeName(rawName: string): string {
  return rawName
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^["'\-–—]+|["'\-–—]+$/g, "")
    .trim();
}

function isValidName(name: string): boolean {
  if (PLACEHOLDER_NAMES.has(name.toLowerCase())) return false;
  return /[a-zA-ZÀ-ÿ]/.test(name);
}

// Rough bounding box for Brazil (including islands); catches null-island (0,0)
// and other clearly wrong coordinates that shouldn't occur given the Overpass
// query is already scoped to area["ISO3166-1"="BR"], but are cheap to guard.
function isValidBrazilCoords(lat: number, lon: number): boolean {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return false;
  if (lat === 0 && lon === 0) return false;
  return lat >= -34 && lat <= 6 && lon >= -74 && lon <= -32;
}

function haversineMeters(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const h = sinLat * sinLat + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLon * sinLon;
  return 2 * R * Math.asin(Math.sqrt(h));
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
  let skippedInvalidName = 0;
  let skippedInvalidCoords = 0;

  for (const el of elements) {
    const tags = el.tags ?? {};
    const rawName = tags.name ?? tags["name:pt"];
    if (!rawName) continue;

    const name = normalizeName(rawName);
    if (!isValidName(name)) {
      skippedInvalidName++;
      continue;
    }

    const coords = elementCoords(el);
    if (!coords || !isValidBrazilCoords(coords.lat, coords.lon)) {
      skippedInvalidCoords++;
      continue;
    }

    churches.push({
      name,
      latitude: coords.lat,
      longitude: coords.lon,
      address: buildAddress(tags),
      city: tags["addr:city"] ?? null,
      state: tags["addr:state"] ?? null,
      phone: tags.phone ?? tags["contact:phone"] ?? null,
      openingHours: tags.opening_hours ?? null,
      source: SOURCE,
    });
  }

  if (skippedInvalidName > 0) {
    console.log(`Skipped ${skippedInvalidName} elements with an invalid/placeholder name.`);
  }
  if (skippedInvalidCoords > 0) {
    console.log(`Skipped ${skippedInvalidCoords} elements with invalid coordinates.`);
  }

  return churches;
}

// True duplicates are the same normalized name within a short real-world
// distance of each other — a coordinate-rounding grid can split identical
// points across cell boundaries or merge distinct nearby ones, so this
// compares actual haversine distance among same-name candidates instead.
const DUPLICATE_DISTANCE_METERS = 100;

function dedupe(churches: NormalizedChurch[]): NormalizedChurch[] {
  const byName = new Map<string, NormalizedChurch[]>();

  for (const church of churches) {
    const key = church.name.toLowerCase();
    const group = byName.get(key);
    if (group) group.push(church);
    else byName.set(key, [church]);
  }

  const deduped: NormalizedChurch[] = [];
  let duplicateCount = 0;

  for (const group of byName.values()) {
    const accepted: NormalizedChurch[] = [];

    for (const candidate of group) {
      const isDuplicate = accepted.some(
        (existing) =>
          haversineMeters(
            { lat: candidate.latitude, lon: candidate.longitude },
            { lat: existing.latitude, lon: existing.longitude },
          ) < DUPLICATE_DISTANCE_METERS,
      );

      if (isDuplicate) {
        duplicateCount++;
      } else {
        accepted.push(candidate);
      }
    }

    deduped.push(...accepted);
  }

  if (duplicateCount > 0) {
    console.log(
      `Removed ${duplicateCount} duplicates (same name within ${DUPLICATE_DISTANCE_METERS}m).`,
    );
  }

  return deduped;
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
