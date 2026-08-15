import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsEnum,
  IsISO8601,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Priority } from '../../generated/prisma/enums';

export class CreateProjectDto {
  @ApiProperty({ example: 'Website Redesign', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ enum: Priority, default: Priority.NO_PRIORITY })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiPropertyOptional({ format: 'date-time', example: '2026-09-01' })
  @IsOptional()
  @IsISO8601()
  dueDate?: string;
}
