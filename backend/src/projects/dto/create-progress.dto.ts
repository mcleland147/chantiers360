import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateProgressDto {
  @IsString()
  @IsNotEmpty()
  comment!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  percent?: number;
}
