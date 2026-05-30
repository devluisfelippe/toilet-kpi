import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { UsersService } from '../users/users.service';
import type { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';

describe('AuthService', () => {
  const jwt = { signAsync: jest.fn().mockResolvedValue('token-fake') };

  function makeUsers(overrides: Partial<Record<string, jest.Mock>> = {}) {
    return {
      findUser: jest.fn().mockResolvedValue(null),
      createUser: jest.fn().mockResolvedValue(undefined),
      ...overrides,
    };
  }

  it('registra um novo usuário e devolve token', async () => {
    const users = makeUsers();
    const svc = new AuthService(
      users as unknown as UsersService,
      jwt as unknown as JwtService,
    );
    const out = await svc.register('zeca', 'segredo');
    expect(users.createUser).toHaveBeenCalledWith('zeca', expect.any(String));
    expect(out.token).toBe('token-fake');
  });

  it('rejeita registro de nickname já existente', async () => {
    const users = makeUsers({
      findUser: jest
        .fn()
        .mockResolvedValue({ nickname: 'zeca', password_hash: 'x' }),
    });
    const svc = new AuthService(
      users as unknown as UsersService,
      jwt as unknown as JwtService,
    );
    await expect(svc.register('zeca', 'segredo')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('rejeita login com senha errada', async () => {
    const hash = await bcrypt.hash('certa', 10);
    const users = makeUsers({
      findUser: jest
        .fn()
        .mockResolvedValue({ nickname: 'zeca', password_hash: hash }),
    });
    const svc = new AuthService(
      users as unknown as UsersService,
      jwt as unknown as JwtService,
    );
    await expect(svc.login('zeca', 'errada')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('faz login com senha certa', async () => {
    const hash = await bcrypt.hash('certa', 10);
    const users = makeUsers({
      findUser: jest
        .fn()
        .mockResolvedValue({ nickname: 'zeca', password_hash: hash }),
    });
    const svc = new AuthService(
      users as unknown as UsersService,
      jwt as unknown as JwtService,
    );
    const out = await svc.login('zeca', 'certa');
    expect(out.token).toBe('token-fake');
  });
});
