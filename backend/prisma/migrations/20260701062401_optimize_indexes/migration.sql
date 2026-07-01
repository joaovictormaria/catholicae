-- The plain (latitude, longitude) btree index is dead weight: every
-- geo query goes through ST_DWithin/ST_Distance against "location" and
-- uses Church_location_gist_idx instead (confirmed via EXPLAIN in Sprint 2).
DROP INDEX "Church_latitude_longitude_idx";

-- Trigram index so name search (`contains`, case-insensitive) doesn't
-- fall back to a sequential scan as the dataset grows.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX "Church_name_trgm_idx" ON "Church" USING GIN (name gin_trgm_ops);

-- Exact-match filters used by GET /churches?city=&state=
CREATE INDEX "Church_city_idx" ON "Church" (city);
CREATE INDEX "Church_state_idx" ON "Church" (state);
