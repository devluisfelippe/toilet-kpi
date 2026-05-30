import { Injectable } from '@nestjs/common';
import { Missao, MISSOES } from './missions.catalog';

@Injectable()
export class MissionsService {
  private readonly catalogo: ReadonlyArray<Missao> = MISSOES;

  sortear(gerarAleatorio: () => number = Math.random): Missao {
    const indiceSorteado = Math.floor(gerarAleatorio() * this.catalogo.length);
    return this.catalogo[Math.min(indiceSorteado, this.catalogo.length - 1)];
  }

  byId(id: string): Missao | undefined {
    return this.catalogo.find((missao) => missao.id === id);
  }
}
