import { IsString, IsNotEmpty, IsArray, ArrayNotEmpty } from "class-validator";

export class ConfirmStageCompletionDtoV1 {
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