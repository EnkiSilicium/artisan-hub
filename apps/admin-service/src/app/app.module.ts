import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminManagementModule } from './modules/admin-management/admin-management.module';

@Module({
  imports: [AdminManagementModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
