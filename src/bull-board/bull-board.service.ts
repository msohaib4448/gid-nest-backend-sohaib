import { Injectable } from '@nestjs/common';
import { createBullBoard } from '@bull-board/api';
import { ExpressAdapter } from '@bull-board/express';
import { Queue } from 'bull';
import { BullAdapter } from '@bull-board/api/bullAdapter';

@Injectable()
export class BullBoardService {
  public readonly serverAdapter: ExpressAdapter;
  public addQueue: (queue: BullAdapter) => void;

  constructor() {
    this.serverAdapter = new ExpressAdapter();
    // const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard(
    const { addQueue } = createBullBoard({
      queues: [],
      serverAdapter: this.serverAdapter,
    });
    this.addQueue = addQueue;
  }

  registerQueue(queue: Queue) {
    const bullAdapter = new BullAdapter(queue);
    this.addQueue(bullAdapter);
  }
}
