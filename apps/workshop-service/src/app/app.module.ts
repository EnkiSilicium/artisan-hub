import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { CapabilityTagsModule } from './modules/capability-tags/capability-tags.module';
import { ProfileModule } from './modules/profile/profile.module';
import { RegistratorModule } from './modules/registrator/registrator.module';
import { StatusModule } from './modules/status/status.module';

@Module({
  imports: [
    RegistratorModule,
    AuthModule,
    ProfileModule,
    CapabilityTagsModule,
    StatusModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
