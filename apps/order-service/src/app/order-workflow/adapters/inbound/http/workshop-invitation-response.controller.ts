import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiCreatedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { WorkshopInvitationResponseService } from 'apps/order-service/src/app/order-workflow/application/services/workshop/workshop-invitation-response.service';
import {
  AcceptWorkshopInvitationDtoV1,
  DeclineWorkshopInvitationDtoV1,
  WorkshopInvitationResponsePaths,
} from 'contracts';

@ApiTags('Order workflow')
@Controller({ path: WorkshopInvitationResponsePaths.Root, version: '1' })
export class WorkshopInvitationResponseController {
  constructor(
    private readonly workshopInvitationResponseService: WorkshopInvitationResponseService,
  ) {}

  @Post(WorkshopInvitationResponsePaths.Accept)
  @ApiOperation({
    summary: 'Accept a workshop invitation',
    description:
      'Accepts a workshop invitation for an order and returns the updated state.',
  })
  @ApiBody({ type: AcceptWorkshopInvitationDtoV1 })
  @ApiCreatedResponse({ description: 'Invitation accepted' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  async accept(
    @Body() body: AcceptWorkshopInvitationDtoV1,
  ) {
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

  @Post(WorkshopInvitationResponsePaths.Decline)
  @ApiOperation({
    summary: 'Decline a workshop invitation',
    description:
      'Declines a workshop invitation for an order and returns the updated state.',
  })
  @ApiBody({ type: DeclineWorkshopInvitationDtoV1 })
  @ApiCreatedResponse({ description: 'Invitation declined' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  async decline(
    @Body() body: DeclineWorkshopInvitationDtoV1,
  ) {
    return await this.workshopInvitationResponseService.declineWorkshopInvitation(
      {
        orderId: body.orderId,
        workshopId: body.workshopId,
      },
    );
  }
}
