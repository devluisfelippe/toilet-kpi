import { Injectable } from '@nestjs/common';
import { Missao, MISSOES } from './missions.catalog';

@Injectable()
export class MissionsService {
  private readonly catalogo: ReadonlyArray<Missao> = MISSOES;

  sortear(rng: () => number = Math.random): Missao {
    const i = Math.floor(rng() * this.catalogo.length);
    return this.catalogo[Math.min(i, this.catalogo.length - 1)];
  }

  byId(id: string): Missao | undefined {
    return this.catalogo.find((m) => m.id === id);
  }
}
