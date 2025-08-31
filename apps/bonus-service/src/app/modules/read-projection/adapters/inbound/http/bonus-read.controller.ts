// read-model/vip-additive.controller.ts
import {
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { BonusReadHandler } from 'apps/bonus-service/src/app/modules/read-projection/application/bonus-read/bonus-read.query-handler';
import { BonusReadresultDto, BonusReadQueryDto } from 'contracts';

@Controller('bonus-read')
export class BonusReadController {
  constructor(private readonly svc: BonusReadHandler) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async read(@Query() q: BonusReadQueryDto): Promise<BonusReadresultDto> {
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
  async refresh(): Promise<{ ok: boolean }> {
    return this.svc.refresh();
  }
}
