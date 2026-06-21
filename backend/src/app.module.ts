import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { ProjectsModule } from './projects/projects.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { IssuesModule } from './issues/issues.module';
import { PhotosModule } from './photos/photos.module';
import { ProgressModule } from './progress/progress.module';
import { AlertsModule } from './alerts/alerts.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { HistoryModule } from './history/history.module';
import { CommonModule } from './common/common.module';
import { PrismaModule } from './prisma/prisma.module';
import { StorageModule } from './storage/storage.module';
import { WorkersModule } from './workers/workers.module';
import { PlanningModule } from './planning/planning.module';
import { BudgetModule } from './budget/budget.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    StorageModule,
    AuthModule,
    UsersModule,
    RolesModule,
    ProjectsModule,
    AssignmentsModule,
    IssuesModule,
    PhotosModule,
    ProgressModule,
    AlertsModule,
    DashboardModule,
    HistoryModule,
    CommonModule,
    WorkersModule,
    PlanningModule,
    BudgetModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
