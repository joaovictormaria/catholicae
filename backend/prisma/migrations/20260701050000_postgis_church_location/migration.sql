-- Match the extensions the postgis/postgis Docker image pre-installs into the
-- default database, so future `prisma migrate dev` shadow-db diffs don't drift.
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;
CREATE EXTENSION IF NOT EXISTS postgis_tiger_geocoder;

-- Add a geography column derived from latitude/longitude for indexed distance queries.
ALTER TABLE "Church" ADD COLUMN "location" geography(Point, 4326);

-- Keep "location" in sync with latitude/longitude on insert/update, since Prisma
-- Client cannot write Unsupported("geography") columns directly.
CREATE OR REPLACE FUNCTION church_set_location() RETURNS trigger AS $$
BEGIN
  NEW."location" := ST_SetSRID(ST_MakePoint(NEW."longitude", NEW."latitude"), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER church_set_location_trigger
  BEFORE INSERT OR UPDATE OF "latitude", "longitude" ON "Church"
  FOR EACH ROW
  EXECUTE FUNCTION church_set_location();

-- Backfill location for rows inserted before this migration.
UPDATE "Church" SET "location" = ST_SetSRID(ST_MakePoint("longitude", "latitude"), 4326)::geography;

-- Geospatial index for ST_DWithin / ST_Distance nearby-search queries.
CREATE INDEX "Church_location_gist_idx" ON "Church" USING GIST ("location");
