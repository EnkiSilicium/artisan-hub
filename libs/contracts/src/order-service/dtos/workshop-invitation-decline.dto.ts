import { IsString, IsNotEmpty, IsArray, ArrayNotEmpty, ValidateNested, Equals, IsISO8601 } from "class-validator";

export class DeclineWorkshopInvitationDtoV1 {
  @IsString()
  @IsNotEmpty()
  workshopId!: string;

  @IsString()
  @IsNotEmpty()
  orderId!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  selectedWorkshops!: string[];
}