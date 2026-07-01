import { Controller, Get, Query } from "@nestjs/common";
import { ChurchesService, NearbyResult } from "./churches.service";
import { NearbyQueryDto } from "./dto/nearby-query.dto";

@Controller("churches")
export class ChurchesController {
  constructor(private readonly churchesService: ChurchesService) {}

  @Get("nearby")
  findNearby(@Query() query: NearbyQueryDto): Promise<NearbyResult> {
    return this.churchesService.findNearby(query);
  }
}
