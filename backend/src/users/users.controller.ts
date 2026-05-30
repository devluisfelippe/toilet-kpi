import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CagadasRepository } from '../cagadas/cagadas.repository';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly users: UsersService,
    private readonly cagadas: CagadasRepository,
  ) {}

  @Get()
  async me(@Req() request: Request & { user: string }) {
    const perfil = await this.users.perfil(request.user);
    const cagadasRecentes = await this.cagadas.recent(request.user, 10);
    const historicoRecente = cagadasRecentes.map((cagada) => ({
      cagadaId: cagada.cagada_id,
      level: cagada.level,
      missao: cagada.mission_text,
      status: cagada.status,
      pclDelta: cagada.pcl_delta,
      quando: cagada.created_at,
    }));
    return { ...perfil, historicoRecente };
  }
}
