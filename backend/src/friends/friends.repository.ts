import { Injectable } from '@nestjs/common';
import { CassandraService } from '../cassandra/cassandra.service';

@Injectable()
export class FriendsRepository {
  constructor(private readonly db: CassandraService) {}

  async addMutual(a: string, b: string): Promise<void> {
    const now = new Date();
    await this.db.execute(
      `INSERT INTO friendships_by_user (owner_nick, friend_nick, created_at) VALUES (?, ?, ?)`,
      [a, b, now],
    );
    await this.db.execute(
      `INSERT INTO friendships_by_user (owner_nick, friend_nick, created_at) VALUES (?, ?, ?)`,
      [b, a, now],
    );
  }

  async listFriends(owner: string): Promise<string[]> {
    const rs = await this.db.execute(
      `SELECT friend_nick FROM friendships_by_user WHERE owner_nick = ?`,
      [owner],
    );
    return rs.rows.map((r) => r['friend_nick'] as string);
  }
}
