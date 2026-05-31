import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { IsString } from 'class-validator';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class AddFriendDto {
  @ApiProperty({ description: 'The nickname of the friend to add' })
  @IsString()
  nickname: string;
}

@ApiTags('Friends')
@ApiBearerAuth()
@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendsController {
  constructor(private readonly friends: FriendsService) {}

  @Post()
  @ApiOperation({ summary: 'Add a friend' })
  add(
    @Req() request: Request & { user: string },
    @Body() addFriendDto: AddFriendDto,
  ) {
    return this.friends.add(request.user, addFriendDto.nickname);
  }

  @Get('ranking')
  @ApiOperation({ summary: 'Get friends ranking' })
  ranking(@Req() request: Request & { user: string }) {
    return this.friends.ranking(request.user);
  }
}
