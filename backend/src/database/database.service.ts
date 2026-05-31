import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { loadConfig } from '../config/app.config';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private db!: DatabaseSync;

  onModuleInit(): void {
    const file = loadConfig().database.file;
    if (file !== ':memory:') {
      mkdirSync(dirname(file), { recursive: true });
    }
    this.logger.log(`Abrindo banco SQLite em: ${file}`);
    this.db = new DatabaseSync(file);
    this.db.exec('PRAGMA journal_mode = WAL');
    this.db.exec('PRAGMA foreign_keys = ON');
    this.createTables();
    this.logger.log('Banco SQLite pronto.');
  }

  onModuleDestroy(): void {
    this.db?.close();
  }

  run(sql: string, params: SQLInputValue[] = []): void {
    this.db.prepare(sql).run(...params);
  }

  get<T>(sql: string, params: SQLInputValue[] = []): T | undefined {
    return this.db.prepare(sql).get(...params) as unknown as T | undefined;
  }

  all<T>(sql: string, params: SQLInputValue[] = []): T[] {
    return this.db.prepare(sql).all(...params) as unknown as T[];
  }

  private createTables(): void {
    const statements = [
      `CREATE TABLE IF NOT EXISTS users (
         nickname      TEXT PRIMARY KEY,
         password_hash TEXT NOT NULL,
         created_at    TEXT NOT NULL
       )`,
      `CREATE TABLE IF NOT EXISTS scores (
         nickname TEXT PRIMARY KEY,
         pcl      INTEGER NOT NULL DEFAULT 0,
         FOREIGN KEY (nickname) REFERENCES users(nickname)
       )`,
      `CREATE TABLE IF NOT EXISTS cagadas (
         id           TEXT PRIMARY KEY,
         nickname     TEXT NOT NULL,
         mission_id   TEXT NOT NULL,
         level        TEXT NOT NULL,
         mission_text TEXT NOT NULL,
         status       TEXT NOT NULL,
         pcl_delta    INTEGER NOT NULL DEFAULT 0,
         created_at   TEXT NOT NULL,
         resolved_at  TEXT,
         FOREIGN KEY (nickname) REFERENCES users(nickname)
       )`,
      `CREATE INDEX IF NOT EXISTS idx_cagadas_nickname ON cagadas(nickname)`,
      `CREATE TABLE IF NOT EXISTS friendships (
         owner_nick  TEXT NOT NULL,
         friend_nick TEXT NOT NULL,
         created_at  TEXT NOT NULL,
         PRIMARY KEY (owner_nick, friend_nick),
         FOREIGN KEY (owner_nick)  REFERENCES users(nickname),
         FOREIGN KEY (friend_nick) REFERENCES users(nickname)
       )`,
    ];
    for (const statement of statements) this.db.exec(statement);
  }
}
