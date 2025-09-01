import { INestApplication, MicroserviceOptions } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Kafka, Consumer, Producer } from 'kafkajs';
import axios from 'axios';
import { KafkaContainer, PostgreSqlContainer } from 'testcontainers';
import { BonusProcessorModule } from 'apps/bonus-service/src/app/modules/bonus-processor/infra/di/bonus-processor.module';
import { BonusReadModule } from 'apps/bonus-service/src/app/modules/read-projection/infra/di/bonus-read.module';
import { bonusProcessorKafkaConfig } from 'apps/bonus-service/src/app/modules/bonus-processor/infra/config/kafka.config';
import { KafkaTopics } from 'contracts';
import { isoNow } from 'shared-kernel';

describe('Bonus processor integration', () => {
  let procApp: INestApplication;
  let readApp: INestApplication;
  let kafka: Kafka;
  let consumer: Consumer;
  let producer: Producer;
  let pg: PostgreSqlContainer;
  let kafkaContainer: KafkaContainer;
  let readUrl: string;

  beforeAll(async () => {
    pg = await new PostgreSqlContainer('postgres:16-alpine').start();
    kafkaContainer = await new KafkaContainer().start();

    process.env.PG_HOST = pg.getHost();
    process.env.PG_PORT = pg.getMappedPort(5432).toString();
    process.env.PG_USER = pg.getUsername();
    process.env.PG_PASSWORD = pg.getPassword();
    process.env.PG_DB = pg.getDatabase();
    process.env.DB_SCHEMA = 'public';
    process.env.KAFKA_BROKER_HOSTNAME = kafkaContainer.getHost();
    process.env.KAFKA_BROKER_PORT = kafkaContainer.getMappedPort(9092).toString();

    procApp = await NestFactory.create(BonusProcessorModule, { logger: false });
    procApp.setGlobalPrefix('api');
    procApp.connectMicroservice<MicroserviceOptions>(
      bonusProcessorKafkaConfig.asNestMicroserviceOptions(),
    );
    await procApp.startAllMicroservices();
    await procApp.listen(0);

    readApp = await NestFactory.create(BonusReadModule, { logger: false });
    readApp.setGlobalPrefix('api');
    await readApp.listen(0);
    readUrl = await readApp.getUrl();

    kafka = new Kafka({
      brokers: [`${kafkaContainer.getHost()}:${kafkaContainer.getMappedPort(9092)}`],
    });
    consumer = kafka.consumer({ groupId: 'bonus-e2e' });
    await consumer.connect();
    await consumer.subscribe({ topic: KafkaTopics.VipStatusUpdates });
    await consumer.subscribe({ topic: KafkaTopics.GradeUpdates });
    producer = kafka.producer();
    await producer.connect();
  }, 60000);

  afterAll(async () => {
    await producer.disconnect();
    await consumer.stop();
    await consumer.disconnect();
    await procApp.close();
    await readApp.close();
    await pg.stop();
    await kafkaContainer.stop();
  });

  it('processes order events and updates bonus profiles', async () => {
    const commissionerId = 'comm-bonus';
    const orderId = 'o1';
    const workshopId = 'w1';

    const waitFor = new Promise<void>((resolve) => {
      let seen = false;
      consumer.run({
        eachMessage: async ({ message }) => {
          const name = message.headers?.['x-event-name']?.toString();
          if (name && !seen) {
            seen = true;
            resolve();
          }
        },
      });
    });

    const placed = {
      eventName: 'OrderPlaced',
      orderID: orderId,
      commissionerID: commissionerId,
      selectedWorkshops: [workshopId],
      request: {
        title: 't',
        description: 'd',
        deadline: isoNow(),
        budget: '10',
      },
      schemaV: 1,
      placedAt: isoNow(),
    };
    await producer.send({
      topic: KafkaTopics.OrderTransitions,
      messages: [
        {
          value: JSON.stringify(placed),
          headers: { 'x-event-name': Buffer.from('OrderPlaced') },
        },
      ],
    });

    const completed = {
      eventName: 'OrderCompleted',
      orderID: orderId,
      commissionerID: commissionerId,
      workshopID: workshopId,
      confirmedAt: isoNow(),
      schemaV: 1,
    };
    await producer.send({
      topic: KafkaTopics.OrderTransitions,
      messages: [
        {
          value: JSON.stringify(completed),
          headers: { 'x-event-name': Buffer.from('OrderCompleted') },
        },
      ],
    });

    await waitFor;

    const res = await axios.get(`${readUrl}/api/bonus-read`, {
      params: { commissionerId },
    });
    expect(res.data.total).toBeGreaterThan(0);
    expect(res.data.items[0].totalPoints).toBeGreaterThan(0);
  }, 60000);
});
