import { Body, Controller, Post } from '@nestjs/common';
import { WorkshopInvitationResponseService } from 'apps/order-service/src/app/order-workflow/application/services/workshop/workshop-invitation-response.service';
import {
  AcceptWorkshopInvitationDtoV1,
  DeclineWorkshopInvitationDtoV1,
} from 'contracts';

@Controller({ path: 'workshop-invitaion', version: '1' })
export class WorkshopInvitationResponseController {
  constructor(
    private readonly workshopInvitationResponseService: WorkshopInvitationResponseService,
  ) {}

  @Post('accept')
  async acceptWorkshopInviation(@Body() body: AcceptWorkshopInvitationDtoV1) {
    return await this.workshopInvitationResponseService.acceptWorkshopInvitation(
      {
        orderId: body.orderId,
        workshopId: body.workshopId,
        payload: {
          ...body.request,
        },
      },
    );
  }

  @Post('decline')
  async declineWorkshopInviation(@Body() body: DeclineWorkshopInvitationDtoV1) {
    return await this.workshopInvitationResponseService.declineWorkshopInvitation(
      {
        orderId: body.orderId,
        workshopId: body.workshopId,
      },
    );
  }
}
