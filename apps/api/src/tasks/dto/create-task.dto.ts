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
}
