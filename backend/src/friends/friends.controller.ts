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
  add(
    @Req() request: Request & { user: string },
    @Body() addFriendDto: AddFriendDto,
  ) {
    return this.friends.add(request.user, addFriendDto.nickname);
  }

  @Get('ranking')
  ranking(@Req() request: Request & { user: string }) {
    return this.friends.ranking(request.user);
  }
}
