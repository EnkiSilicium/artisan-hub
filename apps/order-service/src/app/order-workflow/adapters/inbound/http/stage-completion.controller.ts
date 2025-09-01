import {
  Body,
  Controller,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiCreatedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { StageCompletionService } from 'apps/order-service/src/app/order-workflow/application/services/stage/stage-completion.service';
import { HttpErrorInterceptor } from 'error-handling/interceptor';
import { LoggingInterceptor } from 'observability';
import {
  MarkStageCompletionDtoV1,
  ConfirmStageCompletionDtoV1,
} from 'contracts';

@ApiTags('Order workflow')
@UseInterceptors(HttpErrorInterceptor, LoggingInterceptor)
@Controller({ path: 'stage-completion', version: '1' })
export class StageCompletionController {
  constructor(
    private readonly stageCompletionService: StageCompletionService,
  ) {}

  @Post('mark')
  @ApiOperation({
    summary: 'Mark a stage as completed',
    description: 'Marks a specific stage as completed for an order.',
  })
  @ApiBody({ type: MarkStageCompletionDtoV1 })
  @ApiCreatedResponse({ description: 'Stage marked for completion' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  async mark(
    @Body() body: MarkStageCompletionDtoV1,
  ) {
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
  @ApiOperation({
    summary: 'Confirm a completed stage',
    description: 'Confirms that a previously completed stage is accepted.',
  })
  @ApiBody({ type: ConfirmStageCompletionDtoV1 })
  @ApiCreatedResponse({ description: 'Stage confirmed' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  async confirm(
    @Body() body: ConfirmStageCompletionDtoV1,
  ) {
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
