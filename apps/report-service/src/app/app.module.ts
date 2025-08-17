import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WorkshopReportsModule } from './modules/workshop-reports/workshop-reports.module';
import { OrderReportsModule } from './modules/order-reports/order-reports.module';

@Module({
  imports: [WorkshopReportsModule, OrderReportsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
