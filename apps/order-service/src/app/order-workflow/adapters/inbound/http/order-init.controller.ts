import { Body, Controller, Post } from '@nestjs/common';
import { OrderInitService } from 'apps/order-service/src/app/order-workflow/application/services/order/order-init.service';
import { OrderInitDtoV1 } from 'contracts';

@Controller({ path: 'order', version: '1' })
export class OrderInitController {
  constructor(private readonly orderInitService: OrderInitService) {}

  @Post()
  async postOrderInit(@Body() body: OrderInitDtoV1) {
    return await this.orderInitService.orderInit({
      payload: {
        commissionerId: body.commissionerID,
        selectedWorkshops: body.selectedWorkshops,
        request: body.request,
      },
    });
  }
}
