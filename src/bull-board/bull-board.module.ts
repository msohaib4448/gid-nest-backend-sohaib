import { Global, Module } from '@nestjs/common';
import { BullBoardService } from './bull-board.service';

@Global()
@Module({
  providers: [
    {
      provide: BullBoardService,
      useFactory: () => new BullBoardService(),
    },
  ],
  exports: [BullBoardService],
})
export class BullBoardModule {}
