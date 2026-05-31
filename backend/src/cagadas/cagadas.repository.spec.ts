import { DatabaseService } from '../database/database.service';
import { UsersRepository } from '../users/users.repository';
import { CagadasRepository } from './cagadas.repository';
import { Missao } from '../missions/missions.catalog';

const missao: Missao = {
  id: 'insano-rio',
  level: 'insano',
  text: 'Lave-se no rio.',
};

async function makeRepo(): Promise<{
  repo: CagadasRepository;
  db: DatabaseService;
}> {
  process.env.DATABASE_FILE = ':memory:';
  const db = new DatabaseService();
  db.onModuleInit();
  await new UsersRepository(db).insertUser('zeca', 'hash');
  return { repo: new CagadasRepository(db), db };
}

describe('CagadasRepository', () => {
  it('insere cagada pendente e a recupera por id', async () => {
    const { repo, db } = await makeRepo();
    const id = await repo.insertPending('zeca', missao);
    expect(typeof id).toBe('string');

    const cagada = await repo.findById('zeca', id);
    expect(cagada).toMatchObject({
      cagada_id: id,
      mission_id: 'insano-rio',
      level: 'insano',
      mission_text: 'Lave-se no rio.',
      status: 'pendente',
      pcl_delta: 0,
    });
    expect(cagada?.created_at).toBeInstanceOf(Date);
    expect(cagada?.resolved_at).toBeNull();
    db.onModuleDestroy();
  });

  it('resolve a cagada atualizando status, delta e resolved_at', async () => {
    const { repo, db } = await makeRepo();
    const id = await repo.insertPending('zeca', missao);
    await repo.resolve('zeca', id, 'cumprida', 70);

    const cagada = await repo.findById('zeca', id);
    expect(cagada?.status).toBe('cumprida');
    expect(cagada?.pcl_delta).toBe(70);
    expect(cagada?.resolved_at).toBeInstanceOf(Date);
    db.onModuleDestroy();
  });

  it('lista as mais recentes primeiro', async () => {
    const { repo, db } = await makeRepo();
    const primeiro = await repo.insertPending('zeca', missao);
    const segundo = await repo.insertPending('zeca', missao);

    const recentes = await repo.recent('zeca', 10);
    expect(recentes.map((c) => c.cagada_id)).toEqual([segundo, primeiro]);
    db.onModuleDestroy();
  });

  it('null quando a cagada não é do usuário', async () => {
    const { repo, db } = await makeRepo();
    const id = await repo.insertPending('zeca', missao);
    expect(await repo.findById('outro', id)).toBeNull();
    db.onModuleDestroy();
  });
});
