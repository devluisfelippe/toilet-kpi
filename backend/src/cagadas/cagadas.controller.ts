import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CagadasService } from './cagadas.service';
import { ResolverDto } from './dto/resolver.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Cagadas')
@ApiBearerAuth()
@Controller('cagadas')
@UseGuards(JwtAuthGuard)
export class CagadasController {
  constructor(private readonly cagadas: CagadasService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new mission' })
  registrar(@Req() request: Request & { user: string }) {
    return this.cagadas.registrar(request.user);
  }

  @Post(':id/resolver')
  @ApiOperation({ summary: 'Resolve a mission' })
  resolver(
    @Req() request: Request & { user: string },
    @Param('id') cagadaId: string,
    @Body() resolverDto: ResolverDto,
  ) {
    return this.cagadas.resolver(request.user, cagadaId, resolverDto.resultado);
  }
}
