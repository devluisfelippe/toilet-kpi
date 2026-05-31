import { DatabaseService } from '../database/database.service';
import { UsersRepository } from './users.repository';

function makeRepo(): { repo: UsersRepository; db: DatabaseService } {
  process.env.DATABASE_FILE = ':memory:';
  const db = new DatabaseService();
  db.onModuleInit();
  return { repo: new UsersRepository(db), db };
}

describe('UsersRepository', () => {
  it('insere usuário com score zero e o encontra', async () => {
    const { repo, db } = makeRepo();
    await repo.insertUser('zeca', 'hash-123');

    const user = await repo.findUser('zeca');
    expect(user).toMatchObject({ nickname: 'zeca', password_hash: 'hash-123' });
    expect(user?.created_at).toBeInstanceOf(Date);
    expect(await repo.getScore('zeca')).toBe(0);

    db.onModuleDestroy();
  });

  it('devolve null para usuário inexistente e 0 de score', async () => {
    const { repo, db } = makeRepo();
    expect(await repo.findUser('ninguem')).toBeNull();
    expect(await repo.getScore('ninguem')).toBe(0);
    db.onModuleDestroy();
  });

  it('atualiza o score via upsert', async () => {
    const { repo, db } = makeRepo();
    await repo.insertUser('zeca', 'hash');
    await repo.setScore('zeca', 170);
    expect(await repo.getScore('zeca')).toBe(170);
    await repo.setScore('zeca', 200);
    expect(await repo.getScore('zeca')).toBe(200);
    db.onModuleDestroy();
  });
});
