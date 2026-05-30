import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MissionsService } from '../missions/missions.service';
import { CagadasRepository } from './cagadas.repository';
import { UsersService } from '../users/users.service';
import {
  aplicarPcl,
  patenteDe,
  pclDelta,
  pontosEmJogo,
  Nivel,
  Resultado,
} from '../domain/scoring';

const MENSAGENS: Record<Resultado, string> = {
  cumprida: 'Respeito. Sua patente agradece e o planeta te deve uma.',
  falhou: 'O papel venceu hoje. Luto na celulose. (na verdade, festa pra ela)',
  pulou: 'Covarde. O trono registra sua hesitação.',
};

@Injectable()
export class CagadasService {
  constructor(
    private readonly missions: MissionsService,
    private readonly repo: CagadasRepository,
    private readonly users: UsersService,
  ) {}

  async registrar(nickname: string) {
    const missao = this.missions.sortear();
    const cagadaId = await this.repo.insertPending(nickname, missao);
    return {
      cagadaId,
      mission: { id: missao.id, level: missao.level, text: missao.text },
      pontosEmJogo: pontosEmJogo(missao.level),
    };
  }

  async resolver(nickname: string, cagadaId: string, resultado: Resultado) {
    const cagada = await this.repo.findById(nickname, cagadaId);
    if (!cagada)
      throw new NotFoundException('Essa cagada não existe (ou não é sua).');
    if (cagada.status !== 'pendente')
      throw new ConflictException('Essa cagada já foi resolvida.');

    const atual = await this.users.getScore(nickname);
    const novo = aplicarPcl(atual, pclDelta(cagada.level as Nivel, resultado));
    const deltaAplicado = novo - atual;

    await this.users.setScore(nickname, novo);
    await this.repo.resolve(nickname, cagadaId, resultado, deltaAplicado);

    return {
      pclDelta: deltaAplicado,
      totalPcl: novo,
      patente: patenteDe(novo),
      mensagem: MENSAGENS[resultado],
    };
  }
}
