import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import compression from "compression";
import { AppModule } from "../src/app.module";
import { AllExceptionsFilter } from "../src/common/filters/all-exceptions.filter";
import { ResponseInterceptor } from "../src/common/interceptors/response.interceptor";

let cachedApp: ((req: unknown, res: unknown) => void) | undefined;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(compression());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  await app.init();
  return app.getHttpAdapter().getInstance();
}

export default async function handler(req: unknown, res: unknown) {
  const app = cachedApp ?? (cachedApp = await bootstrap());
  app(req, res);
}
