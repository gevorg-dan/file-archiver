import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'archiver_task_request',
        queueOptions: {
          durable: true,
        },
        noAck: false,
      },
    },
  );
  app.listen(() => console.log('Microservice is listening'));
}
bootstrap();
