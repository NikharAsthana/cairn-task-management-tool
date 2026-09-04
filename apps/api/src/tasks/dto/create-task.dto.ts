import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsEnum,
  IsISO8601,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus, Priority } from '../../generated/prisma/enums';

export class CreateTaskDto {
  @ApiProperty({ example: 'Set up CI pipeline', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  projectId!: string;

  // ApiPropertyOptional vs ApiProperty: purely a documentation-clarity
  // choice, not a functional one — @IsOptional() already makes the field
  // truly optional at runtime either way. ApiPropertyOptional just marks
  // it visibly as optional in the rendered docs, so someone reading the
  // page doesn't have to infer that from the decorator order.
  @ApiPropertyOptional({ enum: TaskStatus, default: TaskStatus.TODO })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({ enum: Priority, default: Priority.NO_PRIORITY })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiPropertyOptional({ format: 'date-time', example: '2026-08-20' })
  @IsOptional()
  @IsISO8601()
  dueDate?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  parentTaskId?: string;

  // Freeform notes/links, stored and returned as raw markdown text — the
  // backend never parses or understands the content, only caps its size.
  // The frontend (TaskDescription component) renders it. 2000 chars is
  // roughly 3-4 paragraphs. There's no shared constant between the two
  // apps, so if this cap ever changes, update MAX_LENGTH in
  // apps/web/src/components/shared/task-description.tsx by hand too.
  @ApiPropertyOptional({ maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}
