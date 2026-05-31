import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class FriendsRepository {
  constructor(private readonly database: DatabaseService) {}

  addMutual(nickname: string, friendNickname: string): Promise<void> {
    const now = new Date().toISOString();
    this.database.run(
      `INSERT OR IGNORE INTO friendships (owner_nick, friend_nick, created_at) VALUES (?, ?, ?)`,
      [nickname, friendNickname, now],
    );
    this.database.run(
      `INSERT OR IGNORE INTO friendships (owner_nick, friend_nick, created_at) VALUES (?, ?, ?)`,
      [friendNickname, nickname, now],
    );
    return Promise.resolve();
  }

  listFriends(owner: string): Promise<string[]> {
    const rows = this.database.all<{ friend_nick: string }>(
      `SELECT friend_nick FROM friendships WHERE owner_nick = ?`,
      [owner],
    );
    return Promise.resolve(rows.map((row) => row.friend_nick));
  }
}
