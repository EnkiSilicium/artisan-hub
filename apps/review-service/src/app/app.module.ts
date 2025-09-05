import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IngestionModule } from './modules/ingestion/ingestion.module';
import { ReadProjectionModule } from './modules/read-projection/read-projection.module';

@Module({
  imports: [IngestionModule, ReadProjectionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
