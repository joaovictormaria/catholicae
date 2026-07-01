import { Type } from "class-transformer";
import { IsOptional, IsString, Max, Min } from "class-validator";

export class SearchQueryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

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
