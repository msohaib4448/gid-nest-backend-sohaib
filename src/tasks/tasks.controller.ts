import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { TasksService } from './tasks.service';
//* TASK SCHEDULING (QUEUE)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('schedule')
  async scheduleTask(@Body() data: { id: number }): Promise<any> {
    if (!data.id) {
      throw new BadRequestException('Task ID must be provided');
    }

    const result = await this.tasksService.scheduleTask(data.id);
    return result;
  }
}
