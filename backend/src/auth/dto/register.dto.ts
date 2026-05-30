import { IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString({ message: 'Seu nick de cagador precisa ser string' })
  nickname!: string;

  @IsString()
  @MinLength(10, {
    message:
      'ta com dó de digitar a senha ? manda pelo menos 10 caracteres ai pra nois',
  })
  senha: string;
}
