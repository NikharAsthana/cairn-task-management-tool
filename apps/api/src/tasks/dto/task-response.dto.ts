import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus, Priority } from '../../generated/prisma/enums';

export class TaskResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ enum: TaskStatus })
  status!: TaskStatus;

  @ApiProperty({ enum: Priority })
  priority!: Priority;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  dueDate!: Date | null;

  @ApiProperty({ format: 'uuid' })
  projectId!: string;

  @ApiProperty({ type: String, format: 'uuid', nullable: true })
  parentTaskId!: string | null;

  @ApiProperty({ format: 'uuid' })
  reporterId!: string;

  @ApiProperty({ format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: Date;
}

export class PaginationMetaDto {
  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  total!: number;
}

export class TaskListResponseDto {
  @ApiProperty({ type: [TaskResponseDto] })
  data!: TaskResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}
