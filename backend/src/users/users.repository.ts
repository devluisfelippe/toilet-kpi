import { Injectable } from '@nestjs/common';
import { CassandraService } from '../cassandra/cassandra.service';

export interface UserRow {
  nickname: string;
  password_hash: string;
  created_at: Date;
}

@Injectable()
export class UsersRepository {
  constructor(private readonly cassandra: CassandraService) {}

  async insertUser(nickname: string, passwordHash: string): Promise<void> {
    await this.cassandra.execute(
      `INSERT INTO users_by_nick (nickname, password_hash, created_at) VALUES (?, ?, ?)`,
      [nickname, passwordHash, new Date()],
    );
    await this.cassandra.execute(
      `INSERT INTO score_by_nick (nickname, pcl) VALUES (?, ?)`,
      [nickname, 0],
    );
  }

  async findUser(nickname: string): Promise<UserRow | null> {
    const resultSet = await this.cassandra.execute(
      `SELECT nickname, password_hash, created_at FROM users_by_nick WHERE nickname = ?`,
      [nickname],
    );
    return (resultSet.first() as unknown as UserRow) ?? null;
  }

  async getScore(nickname: string): Promise<number> {
    const resultSet = await this.cassandra.execute(
      `SELECT pcl FROM score_by_nick WHERE nickname = ?`,
      [nickname],
    );
    const row = resultSet.first();
    return row ? Number(row['pcl']) : 0;
  }

  async setScore(nickname: string, pcl: number): Promise<void> {
    await this.cassandra.execute(
      `INSERT INTO score_by_nick (nickname, pcl) VALUES (?, ?)`,
      [nickname, pcl],
    );
  }
}
