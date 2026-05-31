import { MissionsService } from './missions.service';
import { MISSOES } from './missions.catalog';

describe('MissionsService', () => {
  it('sorteia uma missão do catálogo', () => {
    const service = new MissionsService();
    const drawn = service.sort();
    expect(MISSOES.some((m) => m.id === drawn.id)).toBe(true);
  });

  it('usa o gerador aleatório injetado para escolher o índice', () => {
    const service = new MissionsService();
    const first = service.sort(() => 0);
    expect(first.id).toBe(MISSOES[0].id);
    const last = service.sort(() => 0.999999);
    expect(last.id).toBe(MISSOES[MISSOES.length - 1].id);
  });

  it('encontra missão por id', () => {
    const service = new MissionsService();
    const insaneMission = MISSOES.find((m) => m.level === 'insano');
    expect(insaneMission).toBeDefined();
    expect(service.byId(insaneMission!.id)?.level).toBe('insano');
    expect(service.byId('nao-existe')).toBeUndefined();
  });
});
