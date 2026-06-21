import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'conducteur@batinova.fr' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'demo123' })
  @IsString()
  @MinLength(1)
  password!: string;
}
