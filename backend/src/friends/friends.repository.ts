import { Injectable } from '@nestjs/common';
import { CassandraService } from '../cassandra/cassandra.service';

@Injectable()
export class FriendsRepository {
  constructor(private readonly cassandra: CassandraService) {}

  async addMutual(nickname: string, friendNickname: string): Promise<void> {
    const now = new Date();
    await this.cassandra.execute(
      `INSERT INTO friendships_by_user (owner_nick, friend_nick, created_at) VALUES (?, ?, ?)`,
      [nickname, friendNickname, now],
    );
    await this.cassandra.execute(
      `INSERT INTO friendships_by_user (owner_nick, friend_nick, created_at) VALUES (?, ?, ?)`,
      [friendNickname, nickname, now],
    );
  }

  async listFriends(owner: string): Promise<string[]> {
    const resultSet = await this.cassandra.execute(
      `SELECT friend_nick FROM friendships_by_user WHERE owner_nick = ?`,
      [owner],
    );
    return resultSet.rows.map((row) => row['friend_nick'] as string);
  }
}
