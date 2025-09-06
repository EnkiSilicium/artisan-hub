/* eslint-disable */
import { waitForPortOpen } from '@nx/node/utils';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { KafkaContainer, StartedKafkaContainer } from '@testcontainers/kafka';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

type Stack = {
  pg: StartedPostgreSqlContainer;
  kafka: StartedKafkaContainer;
  app: ChildProcessWithoutNullStreams;
};

declare global {

  var __E2E_STACK__: Stack;
}

module.exports = async function () {
  console.log('\n[E2E] Setting up Postgres, Kafka, and app (Option B)...\n');

  // 1) Infra containers
  const pg = await new PostgreSqlContainer('postgres:16-alpine').start();

  // Confluent image required by KafkaContainer typings in your version
  const KAFKA_IMAGE = process.env.KAFKA_IMAGE ?? 'confluentinc/cp-kafka:7.5.3';
  const kafka = await new KafkaContainer(KAFKA_IMAGE)
    .withStartupTimeout(120_000)
    .start();

  // Prefer getBootstrapServers if available, else use mapped 9093
  const anyKafka = kafka as any;
  const bootstrap: string =
    typeof anyKafka.getBootstrapServers === 'function'
      ? anyKafka.getBootstrapServers()
      : `${kafka.getHost()}:${kafka.getMappedPort(9093)}`;

  // 2) App ports
  const PROC_PORT = Number(process.env.BONUS_PROC_HTTP_PORT ?? 3001);
  const READ_PORT = Number(process.env.BONUS_READ_HTTP_PORT ?? 3002);

  // 3) Environment for the spawned app and for tests
  const env = {
    ...process.env,
    // DB
    PG_HOST: pg.getHost(),
    PG_PORT: String(pg.getMappedPort(5432)),
    PG_USER: pg.getUsername(),
    PG_PASSWORD: pg.getPassword(),
    PG_DB: pg.getDatabase(),
    DB_SCHEMA: 'public',
    // Kafka
    KAFKA_BOOTSTRAP: bootstrap,
    KAFKA_BROKER_HOSTNAME: bootstrap.split(':')[0],
    KAFKA_BROKER_PORT: bootstrap.split(':')[1],
    // HTTP
    ORDER_WRKFLOW_HTTP_PORT: String(PROC_PORT),
    ORDER_READ_HTTP_PORT: String(READ_PORT),
    HTTP_PREFIX: 'api',
    READ_BASE_URL: `http://127.0.0.1:${READ_PORT}`,
    NODE_ENV: 'development',
    DISABLE_AUTH: 'true',
    JWT_PUBLIC_KEY: `MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDtN+d1VO2TopWYkmRBXyMe98xMYbRdhw6NR5TgHngnTPm4n6qusTNWMaRmwOFKoAT905V3odVSCx7BcWe0FU2Y3/DQKZkFSaj0J8HF3WX2Im23zDKGlQvRm8g+2jdYKTrTxFqRxTJMoElWTTMIdGUcUo0a4jio1l4aFs9PxatumQIDAQAB`
  };

  // 4) Spawn the built app (dist/apps/order-service/main)
  const entryApp = path.join(process.cwd(), 'dist', 'apps', 'order-service', 'main.js');
  if (!fs.existsSync(entryApp)) {
    throw new Error(
      `[E2E] Built entry not found at ${entryApp}. Ensure "order-service:build" ran before e2e.`,
    );
  }

  const app = spawn('node', [entryApp], {
    env,
    stdio: 'inherit',
    shell: true, // Windows-friendly
  });

  // 5) Wait for HTTP surfaces
  await waitForPortOpen(PROC_PORT, { host: '127.0.0.1' });
  await waitForPortOpen(READ_PORT, { host: '127.0.0.1' });

  // 6) Keep only live handles for teardown
  (globalThis as any).__E2E_STACK__ = { pg, kafka, app };

  process.env.KAFKA_BOOTSTRAP = env.KAFKA_BOOTSTRAP;
  process.env.READ_BASE_URL = env.READ_BASE_URL;

  console.log(`[E2E] Kafka bootstrap: ${env.KAFKA_BOOTSTRAP}`);
  console.log(`[E2E] Read base URL: ${env.READ_BASE_URL}\n`);
};
