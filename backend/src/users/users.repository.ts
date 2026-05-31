import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface UserRow {
  nickname: string;
  password_hash: string;
  created_at: Date;
}

interface RawUserRow {
  nickname: string;
  password_hash: string;
  created_at: string;
}

@Injectable()
export class UsersRepository {
  constructor(private readonly database: DatabaseService) {}

  insertUser(nickname: string, passwordHash: string): Promise<void> {
    this.database.run(
      `INSERT INTO users (nickname, password_hash, created_at) VALUES (?, ?, ?)`,
      [nickname, passwordHash, new Date().toISOString()],
    );
    this.database.run(`INSERT INTO scores (nickname, pcl) VALUES (?, ?)`, [
      nickname,
      0,
    ]);
    return Promise.resolve();
  }

  findUser(nickname: string): Promise<UserRow | null> {
    const row = this.database.get<RawUserRow>(
      `SELECT nickname, password_hash, created_at FROM users WHERE nickname = ?`,
      [nickname],
    );
    const user = row
      ? {
          nickname: row.nickname,
          password_hash: row.password_hash,
          created_at: new Date(row.created_at),
        }
      : null;
    return Promise.resolve(user);
  }

  getScore(nickname: string): Promise<number> {
    const row = this.database.get<{ pcl: number }>(
      `SELECT pcl FROM scores WHERE nickname = ?`,
      [nickname],
    );
    return Promise.resolve(row ? Number(row.pcl) : 0);
  }

  setScore(nickname: string, pcl: number): Promise<void> {
    this.database.run(
      `INSERT INTO scores (nickname, pcl) VALUES (?, ?)
       ON CONFLICT(nickname) DO UPDATE SET pcl = excluded.pcl`,
      [nickname, pcl],
    );
    return Promise.resolve();
  }
}
