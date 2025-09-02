import { INestApplication, MicroserviceOptions } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Kafka, Consumer } from 'kafkajs';
import axios from 'axios';
import { KafkaContainer, PostgreSqlContainer } from 'testcontainers';
import { OrderWorkflowModule } from 'apps/order-service/src/app/order-workflow/infra/di/order-workflow.module';
import { OrderReadModule } from 'apps/order-service/src/app/read-model/infra/di/order-read.module';
import { orderWorkflowKafkaConfig } from 'apps/order-service/src/app/order-workflow/infra/config/kafka.config';
import { KafkaTopics } from 'contracts';
import { isoNow } from 'shared-kernel';

describe('Order workflow integration', () => {
  let app: INestApplication;
  let readApp: INestApplication;
  let kafka: Kafka;
  let consumer: Consumer;
  let pg: PostgreSqlContainer;
  let kafkaContainer: KafkaContainer;
  let baseUrl: string;
  let readUrl: string;

  beforeAll(async () => {
    pg = await new PostgreSqlContainer('postgres:16-alpine').start();
    kafkaContainer = await new KafkaContainer().start();

    process.env.PG_HOST = pg.getHost();
    process.env.PG_PORT = pg.getMappedPort(5432).toString();
    process.env.PG_USER = pg.getUsername();
    process.env.PG_PASSWORD = pg.getPassword();
    process.env.PG_DB = pg.getDatabase();
    process.env.DB_SCHEMA = 'order_service';
    process.env.TYPEORM_SYNC = 'true';
    process.env.KAFKA_BROKER_HOSTNAME = kafkaContainer.getHost();
    process.env.KAFKA_BROKER_PORT = kafkaContainer.getMappedPort(9092).toString();

    app = await NestFactory.create(OrderWorkflowModule, { logger: false });
    app.setGlobalPrefix('api');
    app.connectMicroservice<MicroserviceOptions>(
      orderWorkflowKafkaConfig.asNestMicroserviceOptions(),
    );
    await app.startAllMicroservices();
    await app.listen(0);
    baseUrl = await app.getUrl();

    readApp = await NestFactory.create(OrderReadModule, { logger: false });
    readApp.setGlobalPrefix('api');
    await readApp.listen(0);
    readUrl = await readApp.getUrl();

    kafka = new Kafka({
      brokers: [`${kafkaContainer.getHost()}:${kafkaContainer.getMappedPort(9092)}`],
    });
    consumer = kafka.consumer({ groupId: 'order-e2e' });
    await consumer.connect();
    await consumer.subscribe({ topic: KafkaTopics.AllResponsesReceived });
    await consumer.subscribe({ topic: KafkaTopics.AllInvitationsDeclined });
    await consumer.subscribe({ topic: KafkaTopics.StageTransitions });
  }, 60000);

  afterAll(async () => {
    await consumer.stop();
    await consumer.disconnect();
    await app.close();
    await readApp.close();
    await pg.stop();
    await kafkaContainer.stop();
  });

  it('emits decline events when all invitations are declined', async () => {
    const commissionerId = 'comm-decline';
    const workshops = ['wd1', 'wd2'];

    await axios.post(`${baseUrl}/api/order`, {
      commissionerId: commissionerId,
      selectedWorkshops: workshops,
      request: {
        title: 'req',
        description: 'desc',
        deadline: isoNow(),
        budget: '10',
      },
    });

    const history = await axios.get(`${readUrl}/api/orders/stages`, {
      params: { commissionerId },
    });
    const orderId = history.data.items[0].orderId;

    const waitFor = new Promise<void>((resolve) => {
      const received = new Set<string>();
      consumer.run({
        eachMessage: async ({ message }) => {
          const name = message.headers?.['x-event-name']?.toString();
          if (name) {
            received.add(name);
            if (
              received.has('AllResponsesReceived') &&
              received.has('AllInvitationsDeclined')
            ) {
              resolve();
            }
          }
        },
      });
    });

    for (const ws of workshops) {
      await axios.post(`${baseUrl}/api/workshop-invitaion/decline`, {
        orderId,
        workshopId: ws,
      });
    }

    await waitFor;

    const historyAfter = await axios.get(`${readUrl}/api/orders/stages`, {
      params: { commissionerId },
    });
    expect(historyAfter.data.total).toBeGreaterThan(0);
  }, 60000);

  it('processes accepted invitation through all stages', async () => {
    const commissionerId = 'comm-accept';
    const workshops = ['wa1', 'wa2'];

    await axios.post(`${baseUrl}/api/order`, {
      commissionerId: commissionerId,
      selectedWorkshops: workshops,
      request: {
        title: 'req',
        description: 'desc',
        deadline: isoNow(),
        budget: '10',
      },
    });

    const history = await axios.get(`${readUrl}/api/orders/stages`, {
      params: { commissionerId },
    });
    const orderId = history.data.items[0].orderId;

    const waitForResponses = new Promise<void>((resolve) => {
      let responses = 0;
      consumer.run({
        eachMessage: async ({ message }) => {
          const name = message.headers?.['x-event-name']?.toString();
          if (name === 'AllResponsesReceived') {
            resolve();
          }
          if (name === 'AllInvitationsDeclined') {
            resolve();
          }
        },
      });
    });

    await axios.post(`${baseUrl}/api/workshop-invitaion/accept`, {
      orderId,
      workshopId: workshops[0],
      request: {
        stages: [
          {
            orderId,
            workshopId: workshops[0],
            stageName: 'Design',
            stageOrder: 0,
            approximateLength: '1d',
            description: 'd',
            needsConfirmation: false,
          },
          {
            orderId,
            workshopId: workshops[0],
            stageName: 'Build',
            stageOrder: 1,
            approximateLength: '1d',
            description: 'b',
            needsConfirmation: true,
          },
          {
            orderId,
            workshopId: workshops[0],
            stageName: 'Deliver',
            stageOrder: 2,
            approximateLength: '1d',
            description: 'c',
            needsConfirmation: false,
          },
        ],
      },
    });

    await axios.post(`${baseUrl}/api/workshop-invitaion/decline`, {
      orderId,
      workshopId: workshops[1],
    });

    await waitForResponses;

    const waitForStages = new Promise<void>((resolve) => {
      const seen = new Set<string>();
      consumer.run({
        eachMessage: async ({ message }) => {
          const name = message.headers?.['x-event-name']?.toString();
          if (name) {
            seen.add(name);
            if (seen.has('AllStagesCompleted')) {
              resolve();
            }
          }
        },
      });
    });

    const mark = async (stage: string) => {
      await axios.post(`${baseUrl}/api/stage-completion/mark`, {
        orderId,
        workshopId: workshops[0],
        commissionerId,
        stageName: stage,
      });
    };
    const confirm = async (stage: string) => {
      await axios.post(`${baseUrl}/api/stage-completion/confirm`, {
        orderId,
        workshopId: workshops[0],
        commissionerId,
        stageName: stage,
      });
    };

    await mark('Design');
    await mark('Build');
    await confirm('Build');
    await mark('Deliver');

    await waitForStages;

    const historyAfter = await axios.get(`${readUrl}/api/orders/stages`, {
      params: { commissionerId },
    });
    expect(historyAfter.data.total).toBeGreaterThan(0);
  }, 120000);
});
