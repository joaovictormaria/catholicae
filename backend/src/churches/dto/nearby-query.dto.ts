import { Type } from "class-transformer";
import { IsLatitude, IsLongitude, IsOptional, Max, Min } from "class-validator";

export class NearbyQueryDto {
  @Type(() => Number)
  @IsLatitude()
  latitude!: number;

  @Type(() => Number)
  @IsLongitude()
  longitude!: number;

  @Type(() => Number)
  @IsOptional()
  @Min(0.1)
  @Max(100)
  radiusKm: number = 5;

  @Type(() => Number)
  @IsOptional()
  @Min(1)
  page: number = 1;

  @Type(() => Number)
  @IsOptional()
  @Min(1)
  @Max(100)
  limit: number = 20;
}
