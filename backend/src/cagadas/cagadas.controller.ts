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
  registrar(@Req() req: Request & { user: string }) {
    return this.cagadas.registrar(req.user);
  }

  @Post(':id/resolver')
  resolver(
    @Req() req: Request & { user: string },
    @Param('id') id: string,
    @Body() dto: ResolverDto,
  ) {
    return this.cagadas.resolver(req.user, id, dto.resultado);
  }
}
