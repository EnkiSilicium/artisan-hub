import {
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { OrderStagesReadService } from 'apps/order-service/src/app/read-model/application/query-handlers/history.query-handler';
import { OrderHistoryQueryResultDto, ReadOrderStagesQueryDto } from 'contracts';

@Controller('orders/stages')
export class OrderHistoryController {
  constructor(private readonly svc: OrderStagesReadService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async read(
    @Query() q: ReadOrderStagesQueryDto,
  ): Promise<OrderHistoryQueryResultDto> {
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
  async refresh(): Promise<{ ok: boolean }> {
    return this.svc.refresh();
  }
}
