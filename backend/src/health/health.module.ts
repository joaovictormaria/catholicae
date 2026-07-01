import { Module } from "@nestjs/common";
import { ChurchesModule } from "../churches/churches.module";
import { HealthController } from "./health.controller";

@Module({
  imports: [ChurchesModule],
  controllers: [HealthController],
})
export class HealthModule {}
