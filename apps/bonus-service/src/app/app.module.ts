import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ReadProjectionModule } from './modules/read-projection/read-projection.module';
import { EventIngestionModule } from './modules/event-ingestion/event-ingestion.module';
import { VipCalculationModule } from './modules/vip-calculation/vip-calculation.module';

@Module({
  imports: [ReadProjectionModule, EventIngestionModule, VipCalculationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
