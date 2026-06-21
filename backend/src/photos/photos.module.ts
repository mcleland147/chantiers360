import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ProjectsModule } from '../projects/projects.module';
import { PhotosController } from './photos.controller';

@Module({
  imports: [AuthModule, ProjectsModule],
  controllers: [PhotosController],
})
export class PhotosModule {}
