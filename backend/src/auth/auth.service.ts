import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async register(
    nickname: string,
    password: string,
  ): Promise<{ token: string; nickname: string }> {
    const existingUser = await this.users.findUser(nickname);
    if (existingUser)
      throw new ConflictException(
        'Esse trono já tem dono. Escolha outro nickname.',
      );
    const passwordHash = await bcrypt.hash(password, 10);
    await this.users.createUser(nickname, passwordHash);
    return { token: await this.sign(nickname), nickname };
  }

  async login(
    nickname: string,
    password: string,
  ): Promise<{ token: string; nickname: string }> {
    const user = await this.users.findUser(nickname);
    if (!user)
      throw new UnauthorizedException('Você não existe pra gente ainda 😔');
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid)
      throw new UnauthorizedException(
        'Anota num papel na próxima pra não esquecer, porque a gente ainda não tem recuperar senha, foi mal 😪',
      );
    return { token: await this.sign(nickname), nickname };
  }

  private sign(nickname: string): Promise<string> {
    return this.jwt.signAsync({ sub: nickname });
  }
}
