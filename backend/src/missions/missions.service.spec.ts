import { MissionsService } from './missions.service';
import { MISSOES } from './missions.catalog';

describe('MissionsService', () => {
  it('sorteia uma missão do catálogo', () => {
    const service = new MissionsService();
    const sorteada = service.sort();
    expect(MISSOES.some((missao) => missao.id === sorteada.id)).toBe(true);
  });

  it('usa o gerador aleatório injetado para escolher o índice', () => {
    const service = new MissionsService();
    const primeira = service.sort(() => 0);
    expect(primeira.id).toBe(MISSOES[0].id);
    const ultima = service.sort(() => 0.999999);
    expect(ultima.id).toBe(MISSOES[MISSOES.length - 1].id);
  });

  it('encontra missão por id', () => {
    const service = new MissionsService();
    const insano = MISSOES.find((missao) => missao.level === 'insano');
    expect(insano).toBeDefined();
    expect(service.byId(insano!.id)?.level).toBe('insano');
    expect(service.byId('nao-existe')).toBeUndefined();
  });
});
