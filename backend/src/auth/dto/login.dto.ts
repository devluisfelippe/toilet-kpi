import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'The nickname of the user' })
  @IsString()
  nickname!: string;

  @ApiProperty({ description: 'The password of the user' })
  @IsString()
  senha!: string;
}
