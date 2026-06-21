import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BudgetModule } from '../budget/budget.module';
import { ProjectsRepository } from '../projects/repositories/projects.repository';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [AuthModule, BudgetModule],
  providers: [DashboardService, ProjectsRepository],
  controllers: [DashboardController],
})
export class DashboardModule {}
