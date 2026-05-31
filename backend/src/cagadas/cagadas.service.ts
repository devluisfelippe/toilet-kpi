import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MissionsService } from '../missions/missions.service';
import { CagadasRepository } from './cagadas.repository';
import { UsersService } from '../users/users.service';
import {
  applyPcl,
  patent,
  pclDelta,
  pointsInGame,
  Nivel,
  Result,
} from '../domain/scoring';

const MENSAGENS: Record<Result, string> = {
  cumprida: 'Respeito. Sua patente agradece e o planeta te deve uma.',
  falhou: 'O papel venceu hoje. Luto na celulose. (na verdade, festa pra ela)',
  pulou: 'Covarde. O trono registra sua hesitação.',
};

@Injectable()
export class CagadasService {
  constructor(
    private readonly missions: MissionsService,
    private readonly repository: CagadasRepository,
    private readonly users: UsersService,
  ) {}

  async register(nickname: string) {
    const mission = this.missions.sort();
    const cagadaId = await this.repository.insertPending(nickname, mission);
    return {
      cagadaId,
      mission: { id: mission.id, level: mission.level, text: mission.text },
      pointsInGame: pointsInGame(mission.level),
    };
  }

  async resolver(nickname: string, cagadaId: string, result: Result) {
    const cagada = await this.repository.findById(nickname, cagadaId);
    if (!cagada)
      throw new NotFoundException('Essa cagada não existe (ou não é sua).');
    if (cagada.status !== 'pendente')
      throw new ConflictException('Essa cagada já foi resolvida.');

    const currentPcl = await this.users.getScore(nickname);
    const newPcl = applyPcl(
      currentPcl,
      pclDelta(cagada.level as Nivel, result),
    );
    const totalPcl = newPcl - currentPcl;

    await this.users.setScore(nickname, newPcl);
    await this.repository.resolve(nickname, cagadaId, result, totalPcl);

    return {
      pclDelta: totalPcl,
      totalPcl: newPcl,
      patent: patent(newPcl),
      mensagem: MENSAGENS[result],
    };
  }
}
