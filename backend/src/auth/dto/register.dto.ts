import { IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @Matches(/^[a-zA-Z0-9_]{3,20}$/, {
    message: 'nickname: 3-20 letras/números/underscore',
  })
  nickname!: string;

  @IsString()
  @MinLength(4, { message: 'senha: mínimo 4 caracteres' })
  senha!: string;
}
