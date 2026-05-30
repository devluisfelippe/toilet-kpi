import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsRepository } from './friends.repository';
import { UsersService } from '../users/users.service';

interface Mocks {
  repo: { addMutual: jest.Mock; listFriends: jest.Mock };
  users: { findUser: jest.Mock; getScore: jest.Mock };
}

function deps(over: Partial<Mocks> = {}): Mocks {
  return {
    repo: {
      addMutual: jest.fn().mockResolvedValue(undefined),
      listFriends: jest.fn().mockResolvedValue([]),
    },
    users: {
      findUser: jest.fn().mockResolvedValue({ nickname: 'amigo' }),
      getScore: jest.fn(),
    },
    ...over,
  };
}

function makeService(d: Mocks): FriendsService {
  return new FriendsService(
    d.repo as unknown as FriendsRepository,
    d.users as unknown as UsersService,
  );
}

describe('FriendsService', () => {
  it('não deixa adicionar a si mesmo', async () => {
    const d = deps();
    const svc = makeService(d);
    await expect(svc.add('zeca', 'zeca')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('404 quando o amigo não existe', async () => {
    const d = deps({
      users: {
        findUser: jest.fn().mockResolvedValue(null),
        getScore: jest.fn(),
      },
    });
    const svc = makeService(d);
    await expect(svc.add('zeca', 'fantasma')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('adiciona amizade mútua', async () => {
    const d = deps();
    const svc = makeService(d);
    await svc.add('zeca', 'amigo');
    expect(d.repo.addMutual).toHaveBeenCalledWith('zeca', 'amigo');
  });

  it('monta o ranking ordenado por PCL com títulos', async () => {
    const scores: Record<string, number> = { zeca: 50, ana: 300, bia: 0 };
    const d = deps({
      repo: {
        addMutual: jest.fn(),
        listFriends: jest.fn().mockResolvedValue(['ana', 'bia']),
      },
      users: {
        findUser: jest.fn(),
        getScore: jest.fn((n: string) => Promise.resolve(scores[n])),
      },
    });
    const svc = makeService(d);
    const ranking = await svc.ranking('zeca');
    expect(ranking.map((r) => r.nickname)).toEqual(['ana', 'zeca', 'bia']);
    expect(ranking[0].titulo).toBe('Soberano do Trono');
    expect(ranking[ranking.length - 1].titulo).toBe('Lanterna da Latrina');
    expect(ranking[1].patente).toBe('Estagiário do Vaso'); // zeca, 50 PCL
  });
});
