import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FriendsRepository } from './friends.repository';
import { UsersService } from '../users/users.service';
import { patenteDe } from '../domain/scoring';

export interface RankingItem {
  nickname: string;
  pcl: number;
  patente: string;
  titulo: string;
}

@Injectable()
export class FriendsService {
  constructor(
    private readonly repo: FriendsRepository,
    private readonly users: UsersService,
  ) {}

  async add(me: string, friend: string): Promise<{ ok: true }> {
    if (me === friend) {
      throw new BadRequestException(
        'Não dá pra competir consigo mesmo, narcisista do vaso.',
      );
    }
    const exists = await this.users.findUser(friend);
    if (!exists) throw new NotFoundException('Esse nickname não existe.');
    await this.repo.addMutual(me, friend);
    return { ok: true };
  }

  async ranking(me: string): Promise<RankingItem[]> {
    const friends = await this.repo.listFriends(me);
    const nicks = [me, ...friends];
    const itens = await Promise.all(
      nicks.map(async (nickname) => {
        const pcl = await this.users.getScore(nickname);
        return {
          nickname,
          pcl,
          patente: patenteDe(pcl),
          titulo: patenteDe(pcl),
        };
      }),
    );
    itens.sort((a, b) => b.pcl - a.pcl);
    if (itens.length > 0) {
      itens[0].titulo = 'Soberano do Trono';
      if (itens.length > 1)
        itens[itens.length - 1].titulo = 'Lanterna da Latrina';
    }
    return itens;
  }
}
