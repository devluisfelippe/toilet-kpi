import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { CagadasService } from './cagadas.service';
import { ResolverDto } from './dto/resolver.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('cagadas')
@UseGuards(JwtAuthGuard)
export class CagadasController {
  constructor(private readonly cagadas: CagadasService) {}

  @Post()
  registrar(@Req() request: Request & { user: string }) {
    return this.cagadas.registrar(request.user);
  }

  @Post(':id/resolver')
  resolver(
    @Req() request: Request & { user: string },
    @Param('id') cagadaId: string,
    @Body() resolverDto: ResolverDto,
  ) {
    return this.cagadas.resolver(request.user, cagadaId, resolverDto.resultado);
  }
}
