import { Kafka } from 'kafkajs';

export const kafka = new Kafka({
  clientId: 'job-platform',
  brokers: ['localhost:9092'],
});

export const producer = kafka.producer();
await producer.connect();
