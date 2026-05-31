import { ConflictException, NotFoundException } from '@nestjs/common';
import { CagadasService } from './cagadas.service';
import { MissionsService } from '../missions/missions.service';
import { CagadasRepository } from './cagadas.repository';
import { UsersService } from '../users/users.service';

const mission = {
  id: 'insano-rio',
  level: 'insano' as const,
  text: 'Lave-se no rio.',
};

interface Mocks {
  missions: { sort: jest.Mock; byId: jest.Mock };
  repository: {
    insertPending: jest.Mock;
    findById: jest.Mock;
    resolve: jest.Mock;
    recent: jest.Mock;
  };
  users: { getScore: jest.Mock; setScore: jest.Mock };
}

function deps(overrides: Partial<Mocks> = {}): Mocks {
  return {
    missions: { sort: jest.fn().mockReturnValue(mission), byId: jest.fn() },
    repository: {
      insertPending: jest.fn().mockResolvedValue('uuid-1'),
      findById: jest.fn(),
      resolve: jest.fn().mockResolvedValue(undefined),
      recent: jest.fn().mockResolvedValue([]),
    },
    users: {
      getScore: jest.fn().mockResolvedValue(100),
      setScore: jest.fn().mockResolvedValue(undefined),
    },
    ...overrides,
  };
}

function makeService(mocks: Mocks): CagadasService {
  return new CagadasService(
    mocks.missions as unknown as MissionsService,
    mocks.repository as unknown as CagadasRepository,
    mocks.users as unknown as UsersService,
  );
}

describe('CagadasService', () => {
  it('registra cagada sorteando missão e devolve pontos em jogo', async () => {
    const mocks = deps();
    const service = makeService(mocks);
    const response = await service.register('zeca');
    expect(mocks.repository.insertPending).toHaveBeenCalledWith(
      'zeca',
      mission,
    );
    expect(response).toEqual({
      cagadaId: 'uuid-1',
      mission: { id: 'insano-rio', level: 'insano', text: 'Lave-se no rio.' },
      pointsInGame: 70,
    });
  });

  it('resolve com cumprida somando pontos', async () => {
    const mocks = deps({
      repository: {
        findById: jest
          .fn()
          .mockResolvedValue({ status: 'pendente', level: 'insano' }),
        resolve: jest.fn().mockResolvedValue(undefined),
        insertPending: jest.fn(),
        recent: jest.fn(),
      },
    });
    const service = makeService(mocks);
    const response = await service.resolver('zeca', 'uuid-1', 'cumprida');
    expect(response.pclDelta).toBe(70);
    expect(response.totalPcl).toBe(170);
    expect(response.patent).toBe('Office-boy da Privada');
    expect(mocks.users.setScore).toHaveBeenCalledWith('zeca', 170);
  });

  it('aplica piso em zero ao falhar', async () => {
    const mocks = deps({
      users: { getScore: jest.fn().mockResolvedValue(10), setScore: jest.fn() },
      repository: {
        findById: jest
          .fn()
          .mockResolvedValue({ status: 'pendente', level: 'insano' }),
        resolve: jest.fn(),
        insertPending: jest.fn(),
        recent: jest.fn(),
      },
    });
    const service = makeService(mocks);
    const response = await service.resolver('zeca', 'uuid-1', 'falhou');
    expect(response.totalPcl).toBe(0);
    expect(response.pclDelta).toBe(-10);
  });

  it('404 quando a cagada não existe', async () => {
    const mocks = deps({
      repository: {
        findById: jest.fn().mockResolvedValue(null),
        insertPending: jest.fn(),
        resolve: jest.fn(),
        recent: jest.fn(),
      },
    });
    const service = makeService(mocks);
    await expect(
      service.resolver('zeca', 'x', 'cumprida'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('409 quando já resolvida', async () => {
    const mocks = deps({
      repository: {
        findById: jest
          .fn()
          .mockResolvedValue({ status: 'cumprida', level: 'leve' }),
        insertPending: jest.fn(),
        resolve: jest.fn(),
        recent: jest.fn(),
      },
    });
    const service = makeService(mocks);
    await expect(
      service.resolver('zeca', 'x', 'cumprida'),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
