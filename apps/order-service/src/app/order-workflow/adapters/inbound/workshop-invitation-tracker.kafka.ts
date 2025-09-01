import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { KafkaTopics } from 'contracts';
import { WorkshopInvitationTracker } from '../../infra/workshop-invitation-tracker/workshop-invitation-tracker.service';

@Controller()
export class WorkshopInvitationTrackerKafkaController {
  constructor(private readonly tracker: WorkshopInvitationTracker) {}

  @MessagePattern(KafkaTopics.InvitationDeclined)
  async handleDeclined(@Payload() payload: any) {
    await this.tracker.handleResponse(payload.orderID, true);
  }

  @MessagePattern(KafkaTopics.InvitationAccepted)
  async handleAccepted(@Payload() payload: any) {
    await this.tracker.handleResponse(payload.orderID, false);
  }
}

