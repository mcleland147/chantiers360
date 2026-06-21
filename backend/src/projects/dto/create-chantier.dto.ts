import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class CreateChantierDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^CHT-\d{3,}$/, {
    message: 'La référence doit respecter le format CHT-XXX.',
  })
  reference!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  client!: string;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsString()
  @IsNotEmpty()
  conductorId!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  expectedEndDate!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  budget?: number;
}
