import { MissionsService } from './missions.service';
import { MISSOES } from './missions.catalog';

describe('MissionsService', () => {
  it('sorteia uma missão do catálogo', () => {
    const svc = new MissionsService();
    const m = svc.sortear();
    expect(MISSOES.some((x) => x.id === m.id)).toBe(true);
  });

  it('usa o rng injetado para escolher o índice', () => {
    const svc = new MissionsService();
    const primeira = svc.sortear(() => 0); // índice 0
    expect(primeira.id).toBe(MISSOES[0].id);
    const ultima = svc.sortear(() => 0.999999); // último índice
    expect(ultima.id).toBe(MISSOES[MISSOES.length - 1].id);
  });

  it('encontra missão por id', () => {
    const svc = new MissionsService();
    expect(svc.byId('insano-rio')?.level).toBe('insano');
    expect(svc.byId('nao-existe')).toBeUndefined();
  });
});
