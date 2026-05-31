import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsRepository } from './friends.repository';
import { UsersService } from '../users/users.service';

interface Mocks {
  repository: { addMutual: jest.Mock; listFriends: jest.Mock };
  users: { findUser: jest.Mock; getScore: jest.Mock };
}

function deps(overrides: Partial<Mocks> = {}): Mocks {
  return {
    repository: {
      addMutual: jest.fn().mockResolvedValue(undefined),
      listFriends: jest.fn().mockResolvedValue([]),
    },
    users: {
      findUser: jest.fn().mockResolvedValue({ nickname: 'amigo' }),
      getScore: jest.fn(),
    },
    ...overrides,
  };
}

function makeService(mocks: Mocks): FriendsService {
  return new FriendsService(
    mocks.repository as unknown as FriendsRepository,
    mocks.users as unknown as UsersService,
  );
}

describe('FriendsService', () => {
  it('não deixa adicionar a si mesmo', async () => {
    const mocks = deps();
    const service = makeService(mocks);
    await expect(service.add('zeca', 'zeca')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('404 quando o amigo não existe', async () => {
    const mocks = deps({
      users: {
        findUser: jest.fn().mockResolvedValue(null),
        getScore: jest.fn(),
      },
    });
    const service = makeService(mocks);
    await expect(service.add('zeca', 'fantasma')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('adiciona amizade mútua', async () => {
    const mocks = deps();
    const service = makeService(mocks);
    await service.add('zeca', 'amigo');
    expect(mocks.repository.addMutual).toHaveBeenCalledWith('zeca', 'amigo');
  });

  it('monta o ranking ordenado por PCL com títulos', async () => {
    const scores: Record<string, number> = { zeca: 50, ana: 300, bia: 0 };
    const mocks = deps({
      repository: {
        addMutual: jest.fn(),
        listFriends: jest.fn().mockResolvedValue(['ana', 'bia']),
      },
      users: {
        findUser: jest.fn(),
        getScore: jest.fn((nickname: string) =>
          Promise.resolve(scores[nickname]),
        ),
      },
    });
    const service = makeService(mocks);
    const ranking = await service.ranking('zeca');
    expect(ranking.map((item) => item.nickname)).toEqual([
      'ana',
      'zeca',
      'bia',
    ]);
    expect(ranking[0].title).toBe('Soberano do Trono');
    expect(ranking[ranking.length - 1].title).toBe('Lanterna da Latrina');
    expect(ranking[1].patent).toBe('Estagiário do Vaso');
  });
});
