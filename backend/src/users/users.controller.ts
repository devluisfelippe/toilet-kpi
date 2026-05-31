import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CagadasRepository } from '../cagadas/cagadas.repository';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('me')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly users: UsersService,
    private readonly cagadas: CagadasRepository,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get current user profile and recent missions' })
  async me(@Req() request: Request & { user: string }) {
    const profile = await this.users.profile(request.user);
    const lastestCagadas = await this.cagadas.recent(request.user, 10);
    const lastestHistoric = lastestCagadas.map((cagada) => ({
      cagadaId: cagada.cagada_id,
      level: cagada.level,
      mission: cagada.mission_text,
      status: cagada.status,
      pclDelta: cagada.pcl_delta,
      when: cagada.created_at,
    }));
    return { ...profile, lastestHistoric };
  }
}
