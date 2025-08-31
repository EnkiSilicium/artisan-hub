import { OrderHistoryProjection } from 'apps/order-service/src/app/read-model/infra/persistence/projections/order-histrory.projection';
import { DataSourceOptions } from 'typeorm';

export const OrderReadTypeOrmOptions: DataSourceOptions = {
  type: 'postgres',
  ...(process.env.PG_URL
    ? {
      url: process.env.PG_URL,
      ssl:
        process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false,
    }
    : {
      host: process.env.PG_HOST ?? 'localhost',
      port: parseInt(process.env.PG_PORT ?? '5432', 10),
      username: process.env.PG_USER ?? 'app',
      password: process.env.PG_PASSWORD ?? 'app',
      database: process.env.PG_DB ?? 'app',
      schema: process.env.DB_SCHEMA || 'public',
      ssl:
        process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false,
    }),
  entities: [OrderHistoryProjection],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  entitySkipConstructor: true,
  
  // toggles
  synchronize: process.env.TYPEORM_SYNC === 'true', // dev only
  migrationsRun: process.env.TYPEORM_MIGRATIONS_RUN === 'true', 
  logging: process.env.TYPEORM_LOGGING
    ? (process.env.TYPEORM_LOGGING.split(',') as DataSourceOptions['logging'])
    : ['error', 'warn'],
  maxQueryExecutionTime: parseInt(process.env.TYPEORM_SLOW_MS ?? '500', 10),
  extra: {
    max: parseInt(process.env.PG_POOL_MAX ?? '10', 10),
    min: parseInt(process.env.PG_POOL_MIN ?? '0', 10),
    idleTimeoutMillis: parseInt(process.env.PG_POOL_IDLE_MS ?? '30000', 10),
    connectionTimeoutMillis: parseInt(
      process.env.PG_POOL_CONN_MS ?? '10000',
      10,
    ),
  },
};
