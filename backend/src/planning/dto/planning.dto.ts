import { IsIn, IsISO8601, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateScheduleSlotDto {
  @IsString()
  @IsNotEmpty()
  workerId!: string;

  @IsString()
  @IsNotEmpty()
  projectId!: string;

  @IsISO8601()
  startAt!: string;

  @IsISO8601()
  endAt!: string;

  @IsOptional()
  @IsIn(['Planifié', 'Confirmé'])
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateScheduleSlotDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  workerId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  projectId?: string;

  @IsOptional()
  @IsISO8601()
  startAt?: string;

  @IsOptional()
  @IsISO8601()
  endAt?: string;

  @IsOptional()
  @IsIn(['Planifié', 'Confirmé', 'Annulé'])
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class PlanningQueryDto {
  @IsISO8601()
  from!: string;

  @IsISO8601()
  to!: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  workerId?: string;
}

export class ConflictQueryDto {
  @IsString()
  @IsNotEmpty()
  workerId!: string;

  @IsISO8601()
  startAt!: string;

  @IsISO8601()
  endAt!: string;

  @IsOptional()
  @IsString()
  excludeSlotId?: string;
}
