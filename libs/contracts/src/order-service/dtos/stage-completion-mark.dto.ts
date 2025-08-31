import { IsString, IsNotEmpty, IsArray, ArrayNotEmpty, ValidateNested, Equals, IsISO8601 } from "class-validator";

export class MarkStageCompletionDtoV1 {
  @IsString()
  @IsNotEmpty()
  workshopId!: string;

  @IsString()
  @IsNotEmpty()
  commissionerId!: string;

  @IsString()
  @IsNotEmpty()
  orderId!: string;

    @IsString()
  @IsNotEmpty()
  stageName!: string;

}
