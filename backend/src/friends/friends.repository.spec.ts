import { DatabaseService } from '../database/database.service';
import { UsersRepository } from '../users/users.repository';
import { FriendsRepository } from './friends.repository';

async function makeRepo(): Promise<{
  repo: FriendsRepository;
  db: DatabaseService;
}> {
  process.env.DATABASE_FILE = ':memory:';
  const db = new DatabaseService();
  db.onModuleInit();
  const users = new UsersRepository(db);
  await users.insertUser('zeca', 'hash');
  await users.insertUser('amigo', 'hash');
  return { repo: new FriendsRepository(db), db };
}

describe('FriendsRepository', () => {
  it('adiciona amizade mútua visível dos dois lados', async () => {
    const { repo, db } = await makeRepo();
    await repo.addMutual('zeca', 'amigo');

    expect(await repo.listFriends('zeca')).toEqual(['amigo']);
    expect(await repo.listFriends('amigo')).toEqual(['zeca']);
    db.onModuleDestroy();
  });

  it('é idempotente: adicionar duas vezes não duplica', async () => {
    const { repo, db } = await makeRepo();
    await repo.addMutual('zeca', 'amigo');
    await repo.addMutual('zeca', 'amigo');

    expect(await repo.listFriends('zeca')).toEqual(['amigo']);
    db.onModuleDestroy();
  });

  it('lista vazia quando não há amigos', async () => {
    const { repo, db } = await makeRepo();
    expect(await repo.listFriends('zeca')).toEqual([]);
    db.onModuleDestroy();
  });
});
