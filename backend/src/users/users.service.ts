import { Injectable } from '@nestjs/common';
import { UsersRepository, UserRow } from './users.repository';
import { patenteDe } from '../domain/scoring';

export interface PerfilResumo {
  nickname: string;
  pcl: number;
  patente: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly repo: UsersRepository) {}

  findUser(nickname: string): Promise<UserRow | null> {
    return this.repo.findUser(nickname);
  }

  createUser(nickname: string, passwordHash: string): Promise<void> {
    return this.repo.insertUser(nickname, passwordHash);
  }

  getScore(nickname: string): Promise<number> {
    return this.repo.getScore(nickname);
  }

  setScore(nickname: string, pcl: number): Promise<void> {
    return this.repo.setScore(nickname, pcl);
  }

  async perfil(nickname: string): Promise<PerfilResumo> {
    const pcl = await this.repo.getScore(nickname);
    return { nickname, pcl, patente: patenteDe(pcl) };
  }
}
