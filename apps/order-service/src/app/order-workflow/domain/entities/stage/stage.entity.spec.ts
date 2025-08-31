// apps/order-service/modules/order-workflow/domain/__tests__/stages-aggregate.spec.ts
import 'reflect-metadata';

// Adjust these paths to your project layout:
import { StagesAggregate, Stage } from './stage.entity';
import { StageStatus } from 'apps/order-service/src/app/order-workflow/domain/entities/stage/stage-status.enum';
import { makeStage } from 'apps/order-service/src/app/order-workflow/domain/entities/stage/stage.entity.mock-factory';

describe('StagesAggregate', () => {
  // ---------------- helpers ----------------
  const uuid = (n = 1) =>
    `${String(n).padStart(8, '0')}-1111-4111-8111-11111111111${n}`;

  const makeStageData = (over: Partial<Stage> = {}) => ({
    ...makeStage({
      orderId: over.orderId ?? uuid(1),
      workshopId: over.workshopId ?? uuid(2),
      stageName:
        over.stageName ?? `stage-${Math.random().toString(36).slice(2, 7)}`,
      approximateLength: over.approximateLength ?? '2d',
      needsConfirmation: over.needsConfirmation ?? false,
      description: over.description ?? 'desc',
      stageOrder: over.stageOrder ?? 0,
      version: over.version ?? 1,
    }),
  });

  describe('constructor & invariants', () => {
    it('normalizes plain objects to Stage instances and preserves Stage instances', () => {
      const s0 = new Stage(
        makeStageData({ stageName: 'design', stageOrder: 0 }),
      );
      const d1 = makeStageData({ stageName: 'engrave', stageOrder: 1 });

      const agg = new StagesAggregate([s0, d1]);

      expect(agg.amountOfStages).toBe(2);
      expect(agg.stages.length).toBe(2);
      expect(agg.stages[0]).toBeInstanceOf(Stage);
      expect(agg.stages[1]).toBeInstanceOf(Stage);
      expect(agg.currentStage).toBe(0); // first pending
    });

    it('throws on duplicate stage_order', () => {
      const a = makeStageData({ stageName: 'A', stageOrder: 0 });
      const b = makeStageData({ stageName: 'B', stageOrder: 0 }); // dup order
      expect(() => new StagesAggregate([a, b])).toThrow();
    });

    it('throws on hole in orders (contiguity 0..N-1 enforced)', () => {
      const s0 = makeStageData({ stageName: 'A', stageOrder: 0 });
      const s2 = makeStageData({ stageName: 'C', stageOrder: 2 }); // missing 1
      expect(() => new StagesAggregate([s0, s2])).toThrow();
    });

    it('throws on duplicate stage_name', () => {
      const s0 = makeStageData({ stageName: 'same', stageOrder: 0 });
      const s1 = makeStageData({ stageName: 'same', stageOrder: 1 });
      expect(() => new StagesAggregate([s0, s1])).toThrow();
    });
  });

  describe('transitions (acceptCompletionMarked/complete)', () => {
    it('transitions to the next state correctly', () => {
      const s0 = new Stage(
        makeStageData({
          stageName: 'A',
          stageOrder: 0,
          needsConfirmation: true,
        }),
      );
      const s1 = new Stage(makeStageData({ stageName: 'B', stageOrder: 1 }));
      const s2 = new Stage(makeStageData({ stageName: 'C', stageOrder: 2 }));

      const agg = new StagesAggregate([s0, s1, s2]);

      agg.acceptCompletionMarked({ stageName: s0.stageName });
      expect(agg.stages[s0.stageOrder].status).toBe(
        StageStatus.AwaitingConfirmation,
      );

      agg.confirmStage({ stageName: s0.stageName });
      expect(agg.stages[s0.stageOrder].status).toBe(StageStatus.Completed);

      agg.acceptCompletionMarked({ stageName: s1.stageName });
      expect(agg.stages[s1.stageOrder].status).toBe(StageStatus.Completed);
    });

    it('correctly detects if the last completion finished all the stages', () => {
      const s0 = new Stage(
        makeStageData({
          stageName: 'A',
          stageOrder: 0,
          needsConfirmation: true,
        }),
      );
      const s1 = new Stage(makeStageData({ stageName: 'B', stageOrder: 1 }));
      const s2 = new Stage(makeStageData({ stageName: 'C', stageOrder: 2 }));

      s0.status = StageStatus.Completed;

      const agg = new StagesAggregate([s0, s1, s2]);
      const result1 = agg.acceptCompletionMarked({ stageName: s1.stageName });
      const result2 = agg.acceptCompletionMarked({ stageName: s2.stageName });

      expect(result1.allCompleted).toBe(false);
      expect(result2.allCompleted).toBe(true);
    });

    it('throws on incorrect transitions', () => {
      const s0 = new Stage(
        makeStageData({
          stageName: 'A',
          stageOrder: 0,
          needsConfirmation: true,
        }),
      );
      const s1 = new Stage(makeStageData({ stageName: 'B', stageOrder: 1 }));
      const s2 = new Stage(makeStageData({ stageName: 'C', stageOrder: 2 }));

      s0.status = StageStatus.Completed;
      const agg = new StagesAggregate([s0, s1, s2]);

      expect(() =>
        agg.acceptCompletionMarked({ stageName: s0.stageName }),
      ).toThrow();
      expect(() =>
        agg.acceptCompletionMarked({ stageName: s2.stageName }),
      ).toThrow();

      expect(() => agg.confirmStage({ stageName: s0.stageName })).toThrow();
      expect(() => agg.confirmStage({ stageName: s1.stageName })).toThrow();
    });
  });

  describe('currentStage pointer logic', () => {
    it('marks "currentStage" as "amountOfStages" if all of stages already completed', () => {
      const s0 = new Stage(
        makeStageData({
          stageName: 'A',
          stageOrder: 0,
          needsConfirmation: true,
        }),
      );
      const s1 = new Stage(makeStageData({ stageName: 'B', stageOrder: 1 }));
      const s2 = new Stage(makeStageData({ stageName: 'C', stageOrder: 2 }));
      // If all completed, sentinel = amountOfStages
      s0.status = StageStatus.Completed;
      s1.status = StageStatus.Completed;
      s2.status = StageStatus.Completed;

      const agg3 = new StagesAggregate([s0, s1, s2]);
      expect(agg3.currentStage).toBe(3); //separate unit test to ensure amountOfStages = 3
    });

    it('marks "currentStage" as "amountOfStages" if the last stage got completed', () => {
      const s0 = new Stage(
        makeStageData({
          stageName: 'A',
          stageOrder: 0,
          needsConfirmation: true,
        }),
      );
      const s1 = new Stage(makeStageData({ stageName: 'B', stageOrder: 1 }));
      const s2 = new Stage(makeStageData({ stageName: 'C', stageOrder: 2 }));
      // If all completed, sentinel = amountOfStages
      s0.status = StageStatus.Completed;
      s1.status = StageStatus.Completed;
      s2.status = StageStatus.Pending;

      const agg4 = new StagesAggregate([s0, s1, s2]);

      agg4.acceptCompletionMarked({ stageName: s2.stageName });
      expect(agg4.currentStage).toBe(3);
    });

    it('does not advance past a stage that is awaiting confirmation', () => {
      const s0 = new Stage(
        makeStageData({
          stageName: 'A',
          stageOrder: 0,
          needsConfirmation: true,
        }),
      );
      const s1 = new Stage(makeStageData({ stageName: 'B', stageOrder: 1 }));
      const s2 = new Stage(makeStageData({ stageName: 'C', stageOrder: 2 }));

      s0.status = StageStatus.Completed;
      s1.status = StageStatus.Completed;
      s2.status = StageStatus.AwaitingConfirmation;

      const agg2 = new StagesAggregate([s0, s1, s2]);
      expect(agg2.currentStage).toBe(2);
    });

    it('increments stage if transitions to completed', () => {
      const s0 = new Stage(
        makeStageData({
          stageName: 'A',
          stageOrder: 0,
          needsConfirmation: true,
        }),
      );
      const s1 = new Stage(makeStageData({ stageName: 'B', stageOrder: 1 }));
      const s2 = new Stage(makeStageData({ stageName: 'C', stageOrder: 2 }));
      s0.status = StageStatus.AwaitingConfirmation;
      s1.status = StageStatus.Pending;
      s2.status = StageStatus.Pending;

      const agg = new StagesAggregate([s0, s1, s2]);
      agg.confirmStage({ stageName: s0.stageName });
      expect(agg.currentStage).toBe(1);

      agg.acceptCompletionMarked({ stageName: s1.stageName });
      expect(agg.currentStage).toBe(2);
    });

    it('does not increment the stage if transitions to "awaiting comfirmation', () => {
      const s0 = new Stage(
        makeStageData({
          stageName: 'A',
          stageOrder: 0,
          needsConfirmation: true,
        }),
      );
      const s1 = new Stage(makeStageData({ stageName: 'B', stageOrder: 1 }));
      const s2 = new Stage(makeStageData({ stageName: 'C', stageOrder: 2 }));
      s0.status = StageStatus.Pending;
      s1.status = StageStatus.Pending;
      s2.status = StageStatus.Pending;

      const agg = new StagesAggregate([s0, s1, s2]);

      agg.acceptCompletionMarked({ stageName: s0.stageName });
      expect(agg.currentStage).toBe(0);
    });
  });

  describe('amountOfStages correctness', () => {
    const s0 = new Stage(
      makeStageData({ stageName: 'A', stageOrder: 0, needsConfirmation: true }),
    );
    const s1 = new Stage(makeStageData({ stageName: 'B', stageOrder: 1 }));
    const s2 = new Stage(makeStageData({ stageName: 'C', stageOrder: 2 }));

    it('is correct', () => {
      const agg3 = new StagesAggregate([s0, s1, s2]);
      expect(agg3.amountOfStages).toBe(3);
    });
  });

  describe('Stage validation (class-validator)', () => {
    it('Stage constructor enforces UUIDs and non-empty strings', () => {
      // bad UUIDs
      expect(
        () =>
          new Stage(
            makeStageData({
              orderId: 'nope' as any,
              workshopId: 'also-bad' as any,
            }),
          ),
      ).toThrow();

      // empty required strings
      expect(
        () =>
          new Stage(
            makeStageData({
              stageName: '' as any,
              description: '' as any,
              approximateLength: '' as any,
            }),
          ),
      ).toThrow();

      // wrong boolean type
      expect(
        () =>
          new Stage(
            makeStageData({
              needsConfirmation: 'yes' as any,
            }),
          ),
      ).toThrow();
    });
  });
});
