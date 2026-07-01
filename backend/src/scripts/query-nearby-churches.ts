import { resolve } from "node:path";
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma";

config({ path: resolve(__dirname, "../../.env") });

// Sé Cathedral, São Paulo — just a fixed reference point to validate the query/index.
const ORIGIN_LAT = -23.5505;
const ORIGIN_LNG = -46.6333;
const RADIUS_METERS = 5000;
const LIMIT = 10;

interface NearbyChurch {
  id: number;
  name: string;
  city: string | null;
  state: string | null;
  distance_meters: number;
}

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  try {
    const churches = await prisma.$queryRaw<NearbyChurch[]>`
      SELECT
        id,
        name,
        city,
        state,
        ST_Distance(location, ST_SetSRID(ST_MakePoint(${ORIGIN_LNG}, ${ORIGIN_LAT}), 4326)::geography) AS distance_meters
      FROM "Church"
      WHERE ST_DWithin(location, ST_SetSRID(ST_MakePoint(${ORIGIN_LNG}, ${ORIGIN_LAT}), 4326)::geography, ${RADIUS_METERS})
      ORDER BY distance_meters ASC
      LIMIT ${LIMIT};
    `;

    console.log(`Churches within ${RADIUS_METERS}m of (${ORIGIN_LAT}, ${ORIGIN_LNG}):`);
    for (const church of churches) {
      console.log(
        `  ${church.distance_meters.toFixed(0)}m — ${church.name} (${church.city ?? "?"}/${church.state ?? "?"})`,
      );
    }

    const explain = await prisma.$queryRaw<{ "QUERY PLAN": string }[]>`
      EXPLAIN ANALYZE
      SELECT id FROM "Church"
      WHERE ST_DWithin(location, ST_SetSRID(ST_MakePoint(${ORIGIN_LNG}, ${ORIGIN_LAT}), 4326)::geography, ${RADIUS_METERS});
    `;
    console.log("\nQuery plan:");
    for (const row of explain) console.log(`  ${row["QUERY PLAN"]}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Failed to query nearby churches:", error);
  process.exitCode = 1;
});
