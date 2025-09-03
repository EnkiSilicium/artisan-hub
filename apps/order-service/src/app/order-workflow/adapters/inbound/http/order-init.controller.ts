import {
  Body,
  Controller,
  Post,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiCreatedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { OrderInitService } from 'apps/order-service/src/app/order-workflow/application/services/order/order-init.service';
  // Re-exported DTO from libs/contracts

import { OrderInitResultDto } from 'contracts';

import { OrderInitDtoV1, OrderInitPaths } from 'contracts';


@ApiTags('Order workflow')
@Controller({ path: OrderInitPaths.Root, version: '1' })
export class OrderInitController {
  constructor(private readonly orderInitService: OrderInitService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new order',
    description: 'Creates a new order with an initial request and selected workshops.',
  })
  @ApiBody({ type: OrderInitDtoV1 })
  @ApiCreatedResponse({
    description: 'Order created successfully',
    type: OrderInitResultDto,
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
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
