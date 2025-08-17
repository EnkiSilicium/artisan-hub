import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HistoryModule } from './modules/history/history.module';
import { OrderWorkflowModule } from './modules/order-workflow/order-workflow.module';

@Module({
  imports: [HistoryModule, OrderWorkflowModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
