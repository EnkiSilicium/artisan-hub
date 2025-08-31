import {
  GradeName,
  GradePolicy,
} from 'apps/bonus-service/src/app/modules/bonus-processor/domain/aggregates/additive-bonus/grade.policy';

describe('GradePolicy', () => {
  describe('getGradeByPoints', () => {
    it('gets the correct grade with input = 0', () => {
      expect(GradePolicy.getGradeByPoints(0)).toBe(GradeName.Bronze);
    });

    it('gets the correct grade with input sitting on the bonus boundary', () => {
      expect(
        GradePolicy.getGradeByPoints(
          GradePolicy.registry.Silver.startThreshold,
        ),
      ).toBe(GradeName.Silver);
      expect(
        GradePolicy.getGradeByPoints(GradePolicy.registry.Gold.startThreshold),
      ).toBe(GradeName.Gold);
      expect(
        GradePolicy.getGradeByPoints(
          GradePolicy.registry.Platinum.startThreshold,
        ),
      ).toBe(GradeName.Platinum);
    });

    it('gets the correct grade in a typical case', () => {
      expect(GradePolicy.getGradeByPoints(123)).toBe(GradeName.Silver);
    });

    it('throws if points < 0', () => {
      expect(() => GradePolicy.getGradeByPoints(-1)).toThrow();
    });
  });
});
