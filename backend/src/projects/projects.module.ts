import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { HistoryModule } from '../history/history.module';
import { ChantierTabsService } from './chantier-tabs.service';
import { ProjectsRepository } from './repositories/projects.repository';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  imports: [AuthModule, HistoryModule],
  providers: [ProjectsService, ChantierTabsService, ProjectsRepository],
  controllers: [ProjectsController],
  exports: [ProjectsService, ChantierTabsService],
})
export class ProjectsModule {}
