import { IsIn } from 'class-validator';

export class ResolverDto {
  @IsIn(['cumprida', 'falhou', 'pulou'], { message: 'resultado inválido' })
  resultado!: 'cumprida' | 'falhou' | 'pulou';
}
