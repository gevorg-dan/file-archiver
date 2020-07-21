import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { Archive } from './entity/archive.entity';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'RABBIT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'archiver_task_request',
          queueOptions: {
            durable: true,
            persistent: true
          },
          noAck: false,
        },
      },
    ]),
    TypeOrmModule.forRoot(),
    TypeOrmModule.forFeature([Archive]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
