import { Injectable } from '@nestjs/common';
import { Connection, Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { User } from '../user/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BullBoardService } from '../bull-board/bull-board.service';

//* TASK SCHEDULING (QUEUE)
@Injectable()
export class TasksService {
  constructor(
    @InjectQueue('task-queue') private readonly taskQueue: Queue<any>,
    private readonly connection: Connection,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly bullBoardService: BullBoardService,
  ) {}

  async scheduleTask(taskId: number) {
    const query = `
      SELECT tasks.*, "user".id as "userId", "user".email as "userEmail"
      FROM tasks
      LEFT JOIN "user" ON tasks."userId" = "user".id
      WHERE tasks.id = $1
    `;

    const task = await this.connection.query(query, [taskId]);
    console.log(task, 'TASKK');
    if (!task || task.length < 1) {
      console.error(`Task with ID ${taskId} not found`);
      return { message: `Task with ID ${taskId} not found` };
    }

    if (task[0].addToCart) {
      await this.taskQueue.add(
        'task-job',
        { task: task[0] },
        { delay: 10 * 1000 },
      );
      this.bullBoardService.registerQueue(this.taskQueue);
      return { message: 'Task scheduled' };
    } else {
      console.error(`Add To Cart is false for task: ${taskId}`);
      return { message: `Add To Cart is false for task: ${taskId}` };
    }
  }

  async sendEmail(task: any) {
    if (task) {
      console.log(
        `Email is being sent to user with ID: ${task.userId} having Email: ${task.userEmail}`,
      );
      return ` Email has been sent to user with ID: ${task.userId} having Email: ${task.userEmail}`;
    } else {
      console.log(`User with ID ${task.userId} not found`);
      return ` User with ID ${task.userId} not found`;
    }
  }
}
