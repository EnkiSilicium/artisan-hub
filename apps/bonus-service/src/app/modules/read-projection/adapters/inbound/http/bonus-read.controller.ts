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
  ApiOkResponse,
  ApiAcceptedResponse,
} from '@nestjs/swagger';
import { BonusReadHandler } from 'apps/bonus-service/src/app/modules/read-projection/application/bonus-read/bonus-read.query-handler';
import { HttpErrorInterceptor } from 'error-handling/interceptor';
import { LoggingInterceptor } from 'observability';
import {
  BonusReadresultDto,
  BonusReadQueryDto,
} from 'contracts';

@ApiTags('Bonus read')
@UseInterceptors(HttpErrorInterceptor, LoggingInterceptor)
@Controller('bonus-read')
export class BonusReadController {
  constructor(private readonly svc: BonusReadHandler) {}

  @Get()
  @ApiOperation({
    summary: 'List VIP/additive bonus records',
    description: 'Returns a paginated list of bonus records with filters.',
  })
  @ApiOkResponse({ type: BonusReadresultDto })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async read(@Query() q: BonusReadQueryDto) {
    return this.svc.read({
      commissionerId: q.commissionerId,
      isVIP: q.isVIP,
      grade: q.grade,
      minTotalPoints: q.minTotalPoints,
      maxTotalPoints: q.maxTotalPoints,
      vipPolicyVersion: q.vipPolicyVersion,
      bonusPolicyVersion: q.bonusPolicyVersion,
      gradePolicyVersion: q.gradePolicyVersion,
      createdFrom: q.createdFrom,
      createdTo: q.createdTo,
      limit: q.limit,
      offset: q.offset,
      sort: q.sort,
      sortDir: q.sortDir,
    });
  }

  @Post('refresh')
  @HttpCode(202)
  @ApiOperation({
    summary: 'Refresh the bonus read projection',
    description: 'Initiates an asynchronous refresh of the bonus read model.',
  })
  @ApiAcceptedResponse({
    description: 'Refresh has been initiated',
  })
  async refresh(): Promise<{ ok: boolean }> {
    return this.svc.refresh();
  }
}
