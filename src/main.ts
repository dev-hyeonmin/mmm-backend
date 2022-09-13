import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log(process.env);
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT || 4000);
}
bootstrap();
