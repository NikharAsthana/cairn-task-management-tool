import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsEnum,
  IsISO8601,
} from 'class-validator';
import { Priority } from '../../generated/prisma/enums';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty() // rejects "", not just missing — a name of "" would pass @IsString()
  @MaxLength(100)
  name!: string;

  @IsOptional() // this whole decorator stack is skipped if the field is absent
  @IsEnum(Priority) // must be one of the actual enum values from your schema
  priority?: Priority;

  @IsOptional()
  @IsISO8601() // strict date-string format check, e.g. "2026-08-20"
  dueDate?: string;
}
