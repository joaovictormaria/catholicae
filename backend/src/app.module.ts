import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ChurchesModule } from "./churches/churches.module";
import { HealthModule } from "./health/health.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [PrismaModule, ChurchesModule, HealthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
