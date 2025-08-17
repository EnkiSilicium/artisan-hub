import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RegistratorModule } from './modules/registrator/registrator.module';
import { AuthModule } from './modules/auth/auth.module';
import { GeneralInfoModule } from './modules/general-info/general-info.module';

@Module({
  imports: [RegistratorModule, AuthModule, GeneralInfoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
