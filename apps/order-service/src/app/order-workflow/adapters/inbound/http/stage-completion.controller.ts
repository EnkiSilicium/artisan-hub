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
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StageCompletionService } from 'apps/order-service/src/app/order-workflow/application/services/stage/stage-completion.service';
import {
  MarkStageCompletionDto,
  ConfirmStageCompletionDto,

  StageCompletionMarkResultDto,
  StageCompletionConfirmResultDto,

  StageCompletionPaths,

} from 'contracts';

@ApiTags('Order workflow')
@ApiBearerAuth('JWT')
@Controller({ path: StageCompletionPaths.Root, version: '1' })
export class StageCompletionController {
  constructor(
    private readonly stageCompletionService: StageCompletionService,
  ) {}

  @Post(StageCompletionPaths.Mark)
  @ApiOperation({
    summary: 'Mark a stage as completed',
    description: 'Marks a specific stage as completed for an order.',
  })
  @ApiBody({ type: MarkStageCompletionDto })
  @ApiCreatedResponse({
    description: 'Stage marked for completion',
    type: StageCompletionMarkResultDto,
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  async mark(
    @Body() body: MarkStageCompletionDto,
  ) {
    return await this.stageCompletionService.acceptCompletionMarked({
      orderId: body.orderId,
      workshopId: body.workshopId,
      payload: {
        stageName: body.stageName,
      },
    });
  }

  @Post(StageCompletionPaths.Confirm)
  @ApiOperation({
    summary: 'Confirm a completed stage',
    description: 'Confirms that a previously completed stage is accepted.',
  })
  @ApiBody({ type: ConfirmStageCompletionDto })
  @ApiCreatedResponse({
    description: 'Stage confirmed',
    type: StageCompletionConfirmResultDto,
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  async confirm(
    @Body() body: ConfirmStageCompletionDto,
  ) {
    return await this.stageCompletionService.confirmCompletion({
      orderId: body.orderId,
      workshopId: body.workshopId,
      payload: {
        stageName: body.stageName,
      },
    });
  }
}
