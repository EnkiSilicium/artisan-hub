import { Body, Controller, Post, HttpCode } from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiBody,
    ApiCreatedResponse,
    ApiBadRequestResponse,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { OrderComfirmCompletionService } from 'apps/order-service/src/app/order-workflow/application/services/order/order-confirm-completion.service';
import { OrderInitDtoV1, OrderConfirmCompletionDtoV1 } from 'contracts';

@ApiTags('Order workflow')
@ApiBearerAuth('JWT')
@Controller({ path: 'order/complete', version: '1' })
export class OrderComfirmCompletionController {
    constructor(private readonly service: OrderComfirmCompletionService) {}

    @Post()
    @HttpCode(200)
    @ApiOperation({
        summary: 'Confirm order completion',
        description:
            'Confirm completion an existing order based on the provided order ID - done by commissioner.',
    })
    @ApiBody({ type: OrderInitDtoV1 })
    @ApiCreatedResponse({ description: 'Order canceled successfully' })
    @ApiBadRequestResponse({ description: 'Validation failed' })
    @ApiBearerAuth('JWT')
    async postOrderCancel(@Body() body: OrderConfirmCompletionDtoV1) {
        return await this.service.confirmCompletion({
            orderId: body.orderId,
            commissionerId: body.commissionerId,
            workshopId: body.workshopId,
        });
    }
}
