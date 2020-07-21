import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JsonParserPipe } from './pipe/json-parser.pipe';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'RABBIT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'archiver_task_response',
          queueOptions: {
            durable: true,
          },
          noAck: false,
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService, JsonParserPipe],
})
export class AppModule {}
