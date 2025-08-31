import { Injectable } from '@nestjs/common';
import {
  RequestEditBudgetCommand,
  RequestEditDescriptionCommand,
  RequestEditDeadlineCommand,
} from 'apps/order-service/src/app/order-workflow/application/services/request/request-edit.command';
import { assertIsFound } from 'apps/order-service/src/app/order-workflow/domain/entities/common/assert-is-found.assertion';
import { RequestEntity } from 'apps/order-service/src/app/order-workflow/domain/entities/request/request.entity';
import { RequestRepo } from 'apps/order-service/src/app/order-workflow/infra/persistence/repositories/request/request.repo';
import { TypeOrmUoW } from 'persistence';

@Injectable()
export class RequestEditService {
  constructor(
    public readonly uow: TypeOrmUoW,
    private readonly requestsRepo: RequestRepo,
  ) {}
  async editBudget(cmd: RequestEditBudgetCommand) {
    return this.uow.runWithRetry({}, async () => {
      const request = await this.requestsRepo.findById(cmd.orderId);

      assertIsFound(request, RequestEntity, {
        orderId: cmd.orderId,
      });

      request.editBudget(cmd.payload.budget);

      await this.requestsRepo.update(request);

      // enqueueOutbox({
      //   id: randomUUID(),
      //   createdAt: isoNow(),
      //   payload: {},
      // });
    });
  }

  async editDescription(cmd: RequestEditDescriptionCommand) {
    return this.uow.runWithRetry({}, async () => {
      const request = await this.requestsRepo.findById(cmd.orderId);
      assertIsFound(request, RequestEntity, {
        orderId: cmd.orderId,
      });

      request.editDescription(cmd.payload.description);

      await this.requestsRepo.update(request);

      // enqueueOutbox({
      //   id: randomUUID(),
      //   createdAt: isoNow(),
      //   payload: {
      //     orderId: cmd.orderId,
      //     workshopId: cmd.workshopId,
      //     status: request.status,
      //   },
      // });
    });
  }

  async editDeadline(cmd: RequestEditDeadlineCommand) {
    return this.uow.runWithRetry({}, async () => {
      const request = await this.requestsRepo.findById(cmd.orderId);
      assertIsFound(request, RequestEntity, {
        orderId: cmd.orderId,
      });

      request.editDeadline(cmd.payload.deadline);

      await this.requestsRepo.update(request);

      // enqueueOutbox({
      //   id: randomUUID(),
      //   createdAt: isoNow(),
      //   payload: {
      //     orderId: cmd.orderId,
      //     workshopId: cmd.workshopId,
      //     status: request.status,
      //   },
      // });
    });
  }
}
