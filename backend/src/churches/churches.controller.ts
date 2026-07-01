import { Controller, Get, Param, ParseIntPipe, Query } from "@nestjs/common";
import { Church } from "../../generated/prisma";
import { ChurchesService, NearbyResult, SearchResult } from "./churches.service";
import { NearbyQueryDto } from "./dto/nearby-query.dto";
import { SearchQueryDto } from "./dto/search-query.dto";

@Controller("churches")
export class ChurchesController {
  constructor(private readonly churchesService: ChurchesService) {}

  @Get("nearby")
  findNearby(@Query() query: NearbyQueryDto): Promise<NearbyResult> {
    return this.churchesService.findNearby(query);
  }

  @Get()
  search(@Query() query: SearchQueryDto): Promise<SearchResult> {
    return this.churchesService.search(query);
  }

  @Get(":id")
  findById(@Param("id", ParseIntPipe) id: number): Promise<Church> {
    return this.churchesService.findById(id);
  }
}
