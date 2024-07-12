import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';
import { config as dotenvConfig } from 'dotenv';
import { BullBoardService } from './bull-board/bull-board.service';

dotenvConfig({ path: '.env' });

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
  });

  const bullBoardService = app.get(BullBoardService);

  // Enable CORS
  app.use(cors());

  bullBoardService.serverAdapter.setBasePath('/admin/queues');

  app.use('/admin/queues', bullBoardService.serverAdapter.getRouter());

  await app.listen(process.env.PORT);
  console.log(`App is listening on port: ${process.env.PORT}`);
  console.log(`For the UI, open ${process.env.PORT}/admin/queues`);
}

bootstrap();
