import { DatabaseService } from './database.service';

describe('DatabaseService', () => {
  let db: DatabaseService;

  beforeEach(() => {
    process.env.DATABASE_FILE = ':memory:';
    db = new DatabaseService();
    db.onModuleInit();
  });

  afterEach(() => {
    db.onModuleDestroy();
  });

  it('cria as tabelas e executa run/get/all', () => {
    db.run(
      `INSERT INTO users (nickname, password_hash, created_at) VALUES (?, ?, ?)`,
      ['zeca', 'hash', '2026-01-01T00:00:00.000Z'],
    );

    const row = db.get<{ nickname: string }>(
      `SELECT nickname FROM users WHERE nickname = ?`,
      ['zeca'],
    );
    expect(row?.nickname).toBe('zeca');

    const rows = db.all<{ nickname: string }>(`SELECT nickname FROM users`);
    expect(rows).toHaveLength(1);
  });

  it('cria todas as tabelas do schema', () => {
    const tables = db
      .all<{
        name: string;
      }>(`SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name`)
      .map((t) => t.name);
    expect(tables).toEqual(
      expect.arrayContaining(['cagadas', 'friendships', 'scores', 'users']),
    );
  });
});
