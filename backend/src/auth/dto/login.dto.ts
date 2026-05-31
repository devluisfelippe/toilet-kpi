import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description:
      'Precisamos do seu nickname (não vamos usar pra nada além de validar você)',
  })
  @IsString()
  nickname: string;

  @ApiProperty({
    description: 'Se tem que colocar a senha também (não é golpe, confia)',
  })
  @IsString()
  password: string;
}
