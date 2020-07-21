import { Controller, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import {
  ClientProxy,
  Ctx,
  EventPattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';

import { CreateArchiveDto } from './dto/create-archive.dto';

@Controller()
export class AppController {
  constructor(
    @Inject('RABBIT_SERVICE') private client: ClientProxy,
    private readonly appService: AppService,
  ) {}

  @EventPattern('create_archive')
  async createArchive(
    @Payload()
    { processId }: any,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    console.log('Task received');
    this.appService.createArchive(processId);
    this.client.emit('archive_ready', { processId });
    console.log('Task sent');

    channel.ack(originalMsg);
  }
}
