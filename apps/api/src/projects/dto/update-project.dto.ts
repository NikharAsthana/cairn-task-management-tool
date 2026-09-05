// apps/api/src/projects/dto/update-project.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateProjectDto } from './create-project.dto';

// PartialType makes every field from CreateProjectDto optional — a PATCH
// should be able to update just the field that changed (e.g. only the
// due date) without the client needing to resend the whole object.
// Unlike UpdateTaskDto there's no OmitType step here: a project has no
// "parent" field to protect (workspaceId/leadId aren't user-editable —
// they were never in CreateProjectDto to begin with, so there's nothing
// to strip out).
export class UpdateProjectDto extends PartialType(CreateProjectDto) {}
