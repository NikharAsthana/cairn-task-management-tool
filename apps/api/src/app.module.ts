import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { envValidationSchema } from './config/env.validation';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { WorkspaceContextModule } from './common/workspace-context/workspace-context.module';
import { TasksModule } from './tasks/tasks.module';

// ConfigModule.forRoot() loads .env into process.env, available app-wide

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    PrismaModule,
    AuthModule,
    ProjectsModule,
    WorkspaceContextModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

// 1b2e59ab-6f1b-4bde-ba1d-e0479128d40f
