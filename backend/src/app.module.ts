import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { CassandraModule } from './cassandra/cassandra.module';
import { MissionsModule } from './missions/missions.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CagadasModule } from './cagadas/cagadas.module';
import { FriendsModule } from './friends/friends.module';
import { LoggingInterceptor } from './common/logging.interceptor';
import { AllExceptionsFilter } from './common/all-exceptions.filter';

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
  providers: [
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
