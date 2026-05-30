import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { IsString } from 'class-validator';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class AddFriendDto {
  @IsString()
  nickname!: string;
}

@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendsController {
  constructor(private readonly friends: FriendsService) {}

  @Post()
  add(@Req() req: Request & { user: string }, @Body() dto: AddFriendDto) {
    return this.friends.add(req.user, dto.nickname);
  }

  @Get('ranking')
  ranking(@Req() req: Request & { user: string }) {
    return this.friends.ranking(req.user);
  }
}
