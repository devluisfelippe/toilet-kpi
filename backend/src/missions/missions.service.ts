import { Injectable } from '@nestjs/common';
import { Missao, MISSOES } from './missions.catalog';

@Injectable()
export class MissionsService {
  private readonly catalog: ReadonlyArray<Missao> = MISSOES;

  sort(generateRandom: () => number = Math.random): Missao {
    const indexSort = Math.floor(generateRandom() * this.catalog.length);
    return this.catalog[Math.min(indexSort, this.catalog.length - 1)];
  }

  byId(id: string): Missao | undefined {
    return this.catalog.find((missao) => missao.id === id);
  }
}
