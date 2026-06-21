import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ProjectsModule } from '../projects/projects.module';
import { IssuesController } from './issues.controller';

@Module({
  imports: [AuthModule, ProjectsModule],
  controllers: [IssuesController],
})
export class IssuesModule {}
