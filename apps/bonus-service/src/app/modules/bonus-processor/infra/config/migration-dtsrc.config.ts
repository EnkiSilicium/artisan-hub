import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { bonusProcessorTypeOrmOptions } from 'apps/bonus-service/src/app/modules/bonus-processor/infra/config/typeorm-config';

export default new DataSource({
  ...bonusProcessorTypeOrmOptions,
  synchronize: false,
});
