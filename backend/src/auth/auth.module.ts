import { Module, forwardRef } from '@nestjs/common';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersModule } from '../users/users.module';
import { loadConfig } from '../config/cassandra.config';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    JwtModule.register({
      secret: loadConfig().jwt.secret,
      signOptions: {
        expiresIn: loadConfig().jwt.expiresIn as JwtSignOptions['expiresIn'],
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [JwtAuthGuard, JwtModule],
})
export class AuthModule {}
