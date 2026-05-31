import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FriendsRepository } from './friends.repository';
import { UsersService } from '../users/users.service';
import { patent } from '../domain/scoring';

export interface RankingItem {
  nickname: string;
  pcl: number;
  patent: string;
  title: string;
}

@Injectable()
export class FriendsService {
  constructor(
    private readonly repository: FriendsRepository,
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
    await this.repository.addMutual(me, friend);
    return { ok: true };
  }

  async ranking(me: string): Promise<RankingItem[]> {
    const friends = await this.repository.listFriends(me);
    const nicknames = [me, ...friends];
    const rankingItems = await Promise.all(
      nicknames.map(async (nickname) => {
        const pcl = await this.users.getScore(nickname);
        return {
          nickname,
          pcl,
          patent: patent(pcl),
          title: patent(pcl),
        };
      }),
    );
    rankingItems.sort((a, b) => b.pcl - a.pcl);
    if (rankingItems.length > 0) {
      rankingItems[0].title = 'Soberano do Trono';
      if (rankingItems.length > 1)
        rankingItems[rankingItems.length - 1].title = 'Lanterna da Latrina';
    }
    return rankingItems;
  }
}
