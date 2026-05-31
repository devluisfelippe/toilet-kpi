import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class ResolverDto {
  @ApiProperty({
    description: 'The result of the mission',
    enum: ['cumprida', 'falhou', 'pulou'],
  })
  @IsIn(['cumprida', 'falhou', 'pulou'], { message: 'resultado inválido' })
  resultado!: 'cumprida' | 'falhou' | 'pulou';
}
