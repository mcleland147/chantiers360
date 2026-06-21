import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

const RESERVE_PRIORITIES = ['Faible', 'Moyenne', 'Haute', 'Critique'] as const;

export class CreateReserveDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsIn(RESERVE_PRIORITIES)
  priority!: (typeof RESERVE_PRIORITIES)[number];
}
