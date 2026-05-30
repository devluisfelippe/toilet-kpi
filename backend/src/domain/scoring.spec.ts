import {
  pclDelta,
  aplicarPcl,
  patenteDe,
  pontosEmJogo,
  Nivel,
} from './scoring';

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
    expect(aplicarPcl(100, 30)).toBe(130);
    expect(aplicarPcl(10, -20)).toBe(0); // não fica negativo
  });

  it('deriva a patente a partir do total', () => {
    expect(patenteDe(0)).toBe('Estagiário do Vaso');
    expect(patenteDe(99)).toBe('Estagiário do Vaso');
    expect(patenteDe(100)).toBe('Office-boy da Privada');
    expect(patenteDe(3000)).toBe('CEO do Banheiro Sustentável');
    expect(patenteDe(999999)).toBe('Lenda Iluminada do Papel Zero');
  });

  it('pontos em jogo é o valor de cumprir o nível', () => {
    expect(pontosEmJogo('medio')).toBe(30);
  });

  it('Nivel é usável como tipo', () => {
    const n: Nivel = 'leve';
    expect(n).toBe('leve');
  });
});
