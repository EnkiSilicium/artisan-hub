import {
  Controller,
  Get,
  Post,
  HttpCode,
  Query,
  UsePipes,
  ValidationPipe,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiOkResponse,
  ApiAcceptedResponse,
} from '@nestjs/swagger';
import { OrderStagesReadService } from 'apps/order-service/src/app/read-model/application/query-handlers/history.query-handler';
import { HttpErrorInterceptor } from 'error-handling/interceptor';
import { LoggingInterceptor } from 'observability';
import {
  OrderHistoryQueryResultDto,
  ReadOrderStagesQueryDto,
} from 'contracts';

@ApiTags('Orders read')
@UseInterceptors(HttpErrorInterceptor, LoggingInterceptor)
@Controller('orders/stages')
export class OrderHistoryController {
  constructor(private readonly svc: OrderStagesReadService) {}

  @Get()
  @ApiOperation({
    summary: 'List order stages',
    description: 'Returns a paginated list of stages with optional filters.',
  })
  @ApiOkResponse({ type: OrderHistoryQueryResultDto })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async read(@Query() q: ReadOrderStagesQueryDto) {
    return this.svc.read({
      commissionerId: q.commissionerId,
      orderState: q.orderState,
      invitationStatus: q.invitationStatus,
      stageStatus: q.stageStatus,
      workshopId: q.workshopId,
      orderCreatedFrom: q.orderCreatedFrom,
      orderCreatedTo: q.orderCreatedTo,
      limit: q.limit,
      offset: q.offset,
      sort: q.sort,
      sortDir: q.sortDir,
    });
  }

  @Post('refresh')
  @HttpCode(202)
  @ApiOperation({
    summary: 'Refresh the read model',
    description: 'Triggers an asynchronous refresh of the read projection.',
  })
  @ApiAcceptedResponse({
    description: 'Refresh has been initiated',
  })
  async refresh(): Promise<{ ok: boolean }> {
    return this.svc.refresh();
  }
}
