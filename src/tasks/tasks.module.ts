import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { BullModule, InjectQueue } from '@nestjs/bull';
import { TasksService } from './tasks.service';
import { TasksProcessor } from './tasks.processor';
import { TasksController } from './tasks.controller';
import { User } from '../user/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullBoardService } from '../bull-board/bull-board.service';
import { Queue } from 'bull';
//* TASK SCHEDULING (QUEUE)
@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'task-queue',
    }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [TasksService, TasksProcessor, BullBoardService],
  controllers: [TasksController],
  exports: [BullModule, TasksService],
})
export class TasksModule implements OnApplicationBootstrap {
  constructor(
    private readonly bullBoardService: BullBoardService,
    @InjectQueue('task-queue') private readonly taskQueue: Queue<any>,
  ) {}

  async onApplicationBootstrap() {
    this.bullBoardService.registerQueue(this.taskQueue);
  }
}
