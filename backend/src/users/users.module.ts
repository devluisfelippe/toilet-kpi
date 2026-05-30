import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { UsersController } from './users.controller';
import { AuthModule } from '../auth/auth.module';
import { CagadasModule } from '../cagadas/cagadas.module';

@Module({
  imports: [forwardRef(() => AuthModule), forwardRef(() => CagadasModule)],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
