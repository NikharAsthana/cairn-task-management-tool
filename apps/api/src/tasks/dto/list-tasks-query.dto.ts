import { Type } from 'class-transformer';
import { IsOptional, IsEnum, IsUUID, IsInt, Min, Max } from 'class-validator';
import { TaskStatus } from '../../generated/prisma/enums';

export class ListTasksQueryDto {
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  // Query string values always arrive as strings, even "2" for a page
  // number — @Type(() => Number) tells class-transformer to coerce it to
  // a real number BEFORE @IsInt() runs. Without it, @IsInt() would
  // correctly reject "2" as not being a number, even though it obviously
  // represents one. This only works because main.ts's ValidationPipe has
  // transform: true.
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100) // caps abuse — without this, ?limit=999999 would pull the entire table in one request
  limit: number = 20;
}
