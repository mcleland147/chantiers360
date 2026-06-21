import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

const PHOTO_CATEGORIES = [
  'Avant travaux',
  'Pendant travaux',
  'Après travaux',
] as const;

export class CreatePhotoDto {
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @IsIn(PHOTO_CATEGORIES)
  category!: (typeof PHOTO_CATEGORIES)[number];

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;
}
