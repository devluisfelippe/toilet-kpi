import { MissionsService } from './missions.service';
import { MISSOES } from './missions.catalog';

describe('MissionsService', () => {
  it('sorteia uma missão do catálogo', () => {
    const service = new MissionsService();
    const sorteada = service.sortear();
    expect(MISSOES.some((missao) => missao.id === sorteada.id)).toBe(true);
  });

  it('usa o gerador aleatório injetado para escolher o índice', () => {
    const service = new MissionsService();
    const primeira = service.sortear(() => 0);
    expect(primeira.id).toBe(MISSOES[0].id);
    const ultima = service.sortear(() => 0.999999);
    expect(ultima.id).toBe(MISSOES[MISSOES.length - 1].id);
  });

  it('encontra missão por id', () => {
    const service = new MissionsService();
    expect(service.byId('insano-rio')?.level).toBe('insano');
    expect(service.byId('nao-existe')).toBeUndefined();
  });
});
