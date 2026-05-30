import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CassandraModule } from './cassandra/cassandra.module';
import { MissionsModule } from './missions/missions.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CagadasModule } from './cagadas/cagadas.module';
import { FriendsModule } from './friends/friends.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CassandraModule,
    MissionsModule,
    UsersModule,
    AuthModule,
    CagadasModule,
    FriendsModule,
  ],
})
export class AppModule {}
