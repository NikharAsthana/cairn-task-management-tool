import { CreateTaskDto } from './create-task.dto';
import { PartialType, OmitType } from '@nestjs/swagger';
// OmitType drops projectId from the shape entirely — this endpoint can't
// move a task between projects. That's a deliberate scope cut, not an
// oversight: "move task to another project" is a meaningfully different
// operation (it should probably be its own endpoint, validated against
// the destination project separately) than "edit this task's fields."
//
// PartialType then makes every remaining field optional — a PATCH should
// be able to update just the one field that changed, not require the
// client to resend the whole object.
export class UpdateTaskDto extends PartialType(
  OmitType(CreateTaskDto, ['projectId'] as const),
) {}
