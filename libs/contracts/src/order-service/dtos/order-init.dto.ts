import { IsString, IsNotEmpty, IsArray, ArrayNotEmpty, ValidateNested, Equals, IsISO8601 } from "class-validator";

export class RequestOrderInitPayload {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;
  
  @IsISO8601() 
  deadline!: string;

  @IsString()
  @IsNotEmpty()
  budget!: string;
}

export class OrderInitDtoV1 {
  @IsString()
  @IsNotEmpty()
  commissionerID!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  selectedWorkshops!: string[];

  @ValidateNested()
  request!: RequestOrderInitPayload;
}

