import { Controller, UseInterceptors } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { KafkaTopics } from 'contracts';
import { WorkshopInvitationTracker } from '../../../infra/workshop-invitation-tracker/workshop-invitation-tracker.service';
import { KafkaErrorInterceptor } from 'error-handling/interceptor';
import { LoggingInterceptor } from 'observability';

@Controller()
export class WorkshopInvitationTrackerKafkaController {
  constructor(private readonly tracker: WorkshopInvitationTracker) {}

  @UseInterceptors(KafkaErrorInterceptor, LoggingInterceptor)

  @EventPattern(KafkaTopics.InvitationDeclined)
  async handleDeclined(@Payload() payload: any) {
    await this.tracker.handleResponse(payload.orderID, true);
  }

  @UseInterceptors(KafkaErrorInterceptor, LoggingInterceptor)
  @EventPattern(KafkaTopics.OrderTransitions)
  async handleAccepted(@Payload() payload: any) {
    if (payload.eventName !== 'InvitationAccepted') { //TODO enum
      return;
    }
    
    await this.tracker.handleResponse(payload.orderID, false);
  }
}

