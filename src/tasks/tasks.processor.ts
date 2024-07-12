import {
  Processor,
  Process,
  OnQueueCompleted,
  OnQueueFailed,
} from '@nestjs/bull';
import { Job } from 'bull';
import { TasksService } from './tasks.service';
//* TASK SCHEDULING (QUEUE)
@Processor('task-queue')
export class TasksProcessor {
  constructor(private readonly tasksService: TasksService) {}

  @Process('task-job')
  async handleTask(job: Job) {
    console.log('Handling task:', job.data);
    return await this.tasksService.sendEmail(job.data.task);
  }

  @OnQueueCompleted()
  handleCompleted(job: Job) {
    console.log(`Job completed with result: ${job.returnvalue}`);
  }

  @OnQueueFailed()
  handleError(job: Job, error: Error) {
    console.log(`Job failed with error: ${error.message}`);
  }
}
