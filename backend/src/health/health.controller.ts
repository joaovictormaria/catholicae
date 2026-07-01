import { Controller, Get } from "@nestjs/common";
import { ChurchesService } from "../churches/churches.service";

@Controller("health")
export class HealthController {
  constructor(private readonly churchesService: ChurchesService) {}

  @Get()
  async check() {
    const churches = await this.churchesService.count();
    return { status: "ok", churches };
  }
}
