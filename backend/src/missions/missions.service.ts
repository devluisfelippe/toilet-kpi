import { Injectable } from '@nestjs/common';
import { Mission, MISSIONS } from './missions.catalog';

@Injectable()
export class MissionsService {
  private readonly catalog: ReadonlyArray<Mission> = MISSIONS;

  sort(generateRandom: () => number = Math.random): Mission {
    const indexSort = Math.floor(generateRandom() * this.catalog.length);
    return this.catalog[Math.min(indexSort, this.catalog.length - 1)];
  }

  byId(id: string): Mission | undefined {
    return this.catalog.find((mission) => mission.id === id);
  }
}
