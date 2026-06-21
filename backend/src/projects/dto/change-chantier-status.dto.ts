import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { STATUS_TO_FRENCH } from '../../common/mappers/chantier.mapper';

const FRENCH_STATUSES = Object.values(STATUS_TO_FRENCH);

export class ChangeChantierStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(FRENCH_STATUSES, {
    message: 'Statut invalide.',
  })
  status!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
