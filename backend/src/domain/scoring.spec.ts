import { pclDelta, applyPcl, patent, pointsInGame, Nivel } from './scoring';

describe('scoring', () => {
  it('dá os pontos certos ao cumprir por nível', () => {
    expect(pclDelta('leve', 'cumprida')).toBe(10);
    expect(pclDelta('medio', 'cumprida')).toBe(30);
    expect(pclDelta('insano', 'cumprida')).toBe(70);
  });

  it('penaliza ao falhar e zera ao pular', () => {
    expect(pclDelta('leve', 'falhou')).toBe(-5);
    expect(pclDelta('insano', 'falhou')).toBe(-20);
    expect(pclDelta('insano', 'pulou')).toBe(0);
  });

  it('aplica o delta com piso em zero', () => {
    expect(applyPcl(100, 30)).toBe(130);
    expect(applyPcl(10, -20)).toBe(0);
  });

  it('deriva a patente a partir do total', () => {
    expect(patent(0)).toBe('Estagiário do Vaso');
    expect(patent(99)).toBe('Estagiário do Vaso');
    expect(patent(100)).toBe('Office-boy da Privada');
    expect(patent(3000)).toBe('CEO do Banheiro Sustentável');
    expect(patent(999999)).toBe('Lenda Iluminada do Papel Zero');
  });

  it('pontos em jogo é o valor de cumprir o nível', () => {
    expect(pointsInGame('medio')).toBe(30);
  });

  it('Nivel é usável como tipo', () => {
    const nivel: Nivel = 'leve';
    expect(nivel).toBe('leve');
  });
});
