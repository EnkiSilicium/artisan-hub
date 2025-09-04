import { Body, Controller, Patch, UseInterceptors } from '@nestjs/common';
import { getHashId } from 'apps/bonus-service/src/app/modules/bonus-processor/adapters/inbound/messaging/kafka.consumer';
import { BonusEventService } from 'apps/bonus-service/src/app/modules/bonus-processor/application/services/bonus-event/bonus-event.service';
import { HttpErrorInterceptor } from 'error-handling/interceptor';
import { LoggingInterceptor } from 'observability';
import { isoNow } from 'shared-kernel';

@Controller('mock')
export class MockController {
  constructor(private readonly bonusService: BonusEventService) {}

  @UseInterceptors(LoggingInterceptor, HttpErrorInterceptor)
  @Patch()
  process(@Body() body: { commissionerId: any; eventName: any }) {
    return this.bonusService.process({
      commissionerId: body.commissionerId,
      eventName: body.eventName,
      eventId: getHashId(body),
      injestedAt: isoNow(),
    });
  }
}
