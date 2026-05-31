import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ description: 'The nickname of the user' })
  @IsString({ message: 'Seu nick de cagador precisa ser string' })
  nickname: string;

  @ApiProperty({ description: 'The password of the user', minLength: 10 })
  @IsString()
  @MinLength(7, {
    message:
      'ta com dó de digitar a senha ? manda pelo menos 7 caracteres ai pra nois',
  })
  password: string;
}
