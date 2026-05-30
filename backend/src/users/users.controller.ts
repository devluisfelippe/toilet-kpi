import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  async me(@Req() req: Request & { user: string }) {
    const perfil = await this.users.perfil(req.user);
    return { ...perfil, historicoRecente: [] as unknown[] };
  }
}
