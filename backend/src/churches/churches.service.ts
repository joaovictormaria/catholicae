import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Church, Prisma } from "../../generated/prisma";
import { NearbyQueryDto } from "./dto/nearby-query.dto";
import { SearchQueryDto } from "./dto/search-query.dto";

interface NearbyChurchRow {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  address: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  openingHours: string | null;
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
  phone: string | null;
  openingHours: string | null;
  source: string;
  distanceMeters: number;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface NearbyResult {
  churches: NearbyChurch[];
  meta: PaginationMeta;
}

export interface SearchResult {
  churches: Church[];
  meta: PaginationMeta;
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
        phone,
        "openingHours",
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

  async search({ name, city, state, page, limit }: SearchQueryDto): Promise<SearchResult> {
    const where: Prisma.ChurchWhereInput = {
      ...(name && { name: { contains: name, mode: "insensitive" } }),
      ...(city && { city: { equals: city, mode: "insensitive" } }),
      ...(state && { state: { equals: state, mode: "insensitive" } }),
    };

    const [churches, total] = await Promise.all([
      this.prisma.church.findMany({
        where,
        orderBy: { name: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.church.count({ where }),
    ]);

    return {
      churches,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: number): Promise<Church> {
    const church = await this.prisma.church.findUnique({ where: { id } });
    if (!church) {
      throw new NotFoundException(`Church with id ${id} not found`);
    }
    return church;
  }
}
