import { Module, forwardRef } from '@nestjs/common';
import { CagadasService } from './cagadas.service';
import { CagadasController } from './cagadas.controller';
import { CagadasRepository } from './cagadas.repository';
import { MissionsModule } from '../missions/missions.module';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [MissionsModule, forwardRef(() => UsersModule), AuthModule],
  controllers: [CagadasController],
  providers: [CagadasService, CagadasRepository],
  exports: [CagadasRepository],
})
export class CagadasModule {}
