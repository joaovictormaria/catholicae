import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NearbyQueryDto } from "./dto/nearby-query.dto";

interface NearbyChurchRow {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  address: string | null;
  city: string | null;
  state: string | null;
  source: string;
  distanceMeters: number;
  totalCount: bigint;
}

export interface NearbyChurch {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  address: string | null;
  city: string | null;
  state: string | null;
  source: string;
  distanceMeters: number;
}

export interface NearbyResult {
  churches: NearbyChurch[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class ChurchesService {
  constructor(private readonly prisma: PrismaService) {}

  count(): Promise<number> {
    return this.prisma.church.count();
  }

  async findNearby({
    latitude,
    longitude,
    radiusKm,
    page,
    limit,
  }: NearbyQueryDto): Promise<NearbyResult> {
    const radiusMeters = radiusKm * 1000;
    const offset = (page - 1) * limit;

    const rows = await this.prisma.$queryRaw<NearbyChurchRow[]>`
      SELECT
        id,
        name,
        latitude,
        longitude,
        address,
        city,
        state,
        source,
        ST_Distance(location, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography) AS "distanceMeters",
        COUNT(*) OVER() AS "totalCount"
      FROM "Church"
      WHERE ST_DWithin(location, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography, ${radiusMeters})
      ORDER BY "distanceMeters" ASC
      LIMIT ${limit}
      OFFSET ${offset};
    `;

    const total = rows.length > 0 ? Number(rows[0].totalCount) : 0;

    return {
      churches: rows.map(({ totalCount: _totalCount, ...church }) => church),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
