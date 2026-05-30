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
  async me(@Req() req: Request & { user: string }) {
    const perfil = await this.users.perfil(req.user);
    const recentes = await this.cagadas.recent(req.user, 10);
    const historicoRecente = recentes.map((c) => ({
      cagadaId: c.cagada_id,
      level: c.level,
      missao: c.mission_text,
      status: c.status,
      pclDelta: c.pcl_delta,
      quando: c.created_at,
    }));
    return { ...perfil, historicoRecente };
  }
}
