import { ConflictException, NotFoundException } from '@nestjs/common';
import { CagadasService } from './cagadas.service';
import { MissionsService } from '../missions/missions.service';
import { CagadasRepository } from './cagadas.repository';
import { UsersService } from '../users/users.service';

const missao = {
  id: 'insano-rio',
  level: 'insano' as const,
  text: 'Lave-se no rio.',
};

interface Mocks {
  missions: { sortear: jest.Mock; byId: jest.Mock };
  repo: {
    insertPending: jest.Mock;
    findById: jest.Mock;
    resolve: jest.Mock;
    recent: jest.Mock;
  };
  users: { getScore: jest.Mock; setScore: jest.Mock };
}

function deps(over: Partial<Mocks> = {}): Mocks {
  return {
    missions: { sortear: jest.fn().mockReturnValue(missao), byId: jest.fn() },
    repo: {
      insertPending: jest.fn().mockResolvedValue('uuid-1'),
      findById: jest.fn(),
      resolve: jest.fn().mockResolvedValue(undefined),
      recent: jest.fn().mockResolvedValue([]),
    },
    users: {
      getScore: jest.fn().mockResolvedValue(100),
      setScore: jest.fn().mockResolvedValue(undefined),
    },
    ...over,
  };
}

function makeService(d: Mocks): CagadasService {
  return new CagadasService(
    d.missions as unknown as MissionsService,
    d.repo as unknown as CagadasRepository,
    d.users as unknown as UsersService,
  );
}

describe('CagadasService', () => {
  it('registra cagada sorteando missão e devolve pontos em jogo', async () => {
    const d = deps();
    const svc = makeService(d);
    const out = await svc.registrar('zeca');
    expect(d.repo.insertPending).toHaveBeenCalledWith('zeca', missao);
    expect(out).toEqual({
      cagadaId: 'uuid-1',
      mission: { id: 'insano-rio', level: 'insano', text: 'Lave-se no rio.' },
      pontosEmJogo: 70,
    });
  });

  it('resolve com cumprida somando pontos', async () => {
    const d = deps({
      repo: {
        findById: jest
          .fn()
          .mockResolvedValue({ status: 'pendente', level: 'insano' }),
        resolve: jest.fn().mockResolvedValue(undefined),
        insertPending: jest.fn(),
        recent: jest.fn(),
      },
    });
    const svc = makeService(d);
    const out = await svc.resolver('zeca', 'uuid-1', 'cumprida');
    expect(out.pclDelta).toBe(70);
    expect(out.totalPcl).toBe(170);
    expect(out.patente).toBe('Office-boy da Privada');
    expect(d.users.setScore).toHaveBeenCalledWith('zeca', 170);
  });

  it('aplica piso em zero ao falhar', async () => {
    const d = deps({
      users: { getScore: jest.fn().mockResolvedValue(10), setScore: jest.fn() },
      repo: {
        findById: jest
          .fn()
          .mockResolvedValue({ status: 'pendente', level: 'insano' }),
        resolve: jest.fn(),
        insertPending: jest.fn(),
        recent: jest.fn(),
      },
    });
    const svc = makeService(d);
    const out = await svc.resolver('zeca', 'uuid-1', 'falhou');
    expect(out.totalPcl).toBe(0); // 10 - 20 -> piso 0
    expect(out.pclDelta).toBe(-10); // delta aplicado real (0 - 10)
  });

  it('404 quando a cagada não existe', async () => {
    const d = deps({
      repo: {
        findById: jest.fn().mockResolvedValue(null),
        insertPending: jest.fn(),
        resolve: jest.fn(),
        recent: jest.fn(),
      },
    });
    const svc = makeService(d);
    await expect(svc.resolver('zeca', 'x', 'cumprida')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('409 quando já resolvida', async () => {
    const d = deps({
      repo: {
        findById: jest
          .fn()
          .mockResolvedValue({ status: 'cumprida', level: 'leve' }),
        insertPending: jest.fn(),
        resolve: jest.fn(),
        recent: jest.fn(),
      },
    });
    const svc = makeService(d);
    await expect(svc.resolver('zeca', 'x', 'cumprida')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});
