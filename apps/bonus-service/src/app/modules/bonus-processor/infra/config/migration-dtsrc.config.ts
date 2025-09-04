import 'reflect-metadata';
import { bonusProcessorTypeOrmOptions } from 'apps/bonus-service/src/app/modules/bonus-processor/infra/config/typeorm-config';
import { DataSource } from 'typeorm';

export default new DataSource({
  ...bonusProcessorTypeOrmOptions,
  synchronize: false,
});
