import { IsString, IsNotEmpty, IsArray, ArrayNotEmpty, ValidateNested, Equals, IsISO8601 } from "class-validator";

export class AcceptWorkshopInvitationPayload {

  @IsString()
  @IsNotEmpty()
  description!: string;
  
  @IsISO8601() 
  deadline!: string;

  @IsString()
  @IsNotEmpty()
  budget!: string;
}


export class AcceptWorkshopInvitationDtoV1 {
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

  @ValidateNested()
  request!: AcceptWorkshopInvitationPayload;
}


