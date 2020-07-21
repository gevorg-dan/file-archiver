import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'archiver_task_response',
      queueOptions: {
        durable: true,
      },
      noAck: false,
    },
  });

  await app.startAllMicroservicesAsync();
  await app.listen(4040);
}
bootstrap();
