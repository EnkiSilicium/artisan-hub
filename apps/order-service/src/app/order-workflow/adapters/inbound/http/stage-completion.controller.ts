import { Body, Controller, Post } from '@nestjs/common';
import { StageCompletionService } from 'apps/order-service/src/app/order-workflow/application/services/stage/stage-completion.service';
import {
  AcceptWorkshopInvitationDtoV1,
  ConfirmStageCompletionDtoV1,
  DeclineWorkshopInvitationDtoV1,
  MarkStageCompletionDtoV1,
} from 'contracts';

@Controller({ path: 'stage-completion', version: '1' })
export class StageCompletionController {
  constructor(
    private readonly stageCompletionService: StageCompletionService,
  ) {}

  @Post('mark')
  async acceptWorkshopInviation(@Body() body: MarkStageCompletionDtoV1) {
    return await this.stageCompletionService.acceptCompletionMarked({
      orderId: body.orderId,
      workshopId: body.workshopId,
      commissionerId: body.commissionerId,
      payload: {
        stageName: body.stageName,
      },
    });
  }

  @Post('confirm')
  async declineWorkshopInviation(@Body() body: ConfirmStageCompletionDtoV1) {
    return await this.stageCompletionService.confirmCompletion({
      orderId: body.orderId,
      workshopId: body.workshopId,
      commissionerId: body.commissionerId,
      payload: {
        stageName: body.stageName,
      },
    });
  }
}
