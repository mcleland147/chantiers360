import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { HistoryModule } from '../history/history.module';
import { WorkersModule } from '../workers/workers.module';
import { PlanningController } from './planning.controller';
import { PlanningService } from './planning.service';

@Module({
  imports: [AuthModule, WorkersModule, HistoryModule],
  controllers: [PlanningController],
  providers: [PlanningService],
})
export class PlanningModule {}
