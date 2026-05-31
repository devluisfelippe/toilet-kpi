import { MISSIONS, Mission } from './missions.catalog';

const NIVEIS: ReadonlyArray<Mission['level']> = ['leve', 'medio', 'insano'];

describe('catálogo de missões', () => {
  it('tem ao menos 200 missões', () => {
    expect(MISSIONS.length).toBeGreaterThanOrEqual(200);
  });

  it('cobre os três níveis com pelo menos 3 missões cada', () => {
    for (const level of NIVEIS) {
      const count = MISSIONS.filter((m) => m.level === level).length;
      expect(count).toBeGreaterThanOrEqual(3);
    }
  });

  it('não tem ids duplicados', () => {
    const ids = MISSIONS.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('toda missão tem nível válido, id e texto não-vazios', () => {
    const validLevels = new Set<string>(NIVEIS);
    for (const m of MISSIONS) {
      expect(validLevels.has(m.level)).toBe(true);
      expect(m.id.trim().length).toBeGreaterThan(0);
      expect(m.text.trim().length).toBeGreaterThan(0);
    }
  });
});
