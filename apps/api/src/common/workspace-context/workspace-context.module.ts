import { Global, Module } from '@nestjs/common';
import { WorkspaceContextService } from './workspace-context.service';

// @Global() means this module's providers are available everywhere in the
// app without every other module having to explicitly import it — same
// pattern already used for PrismaModule back in Phase 3. Register it once
// in AppModule and both ProjectsModule and TasksModule can just inject
// WorkspaceContextService directly.
@Global()
@Module({
  providers: [WorkspaceContextService],
  exports: [WorkspaceContextService],
})
export class WorkspaceContextModule {}
