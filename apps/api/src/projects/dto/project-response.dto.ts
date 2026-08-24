// apps/api/src/projects/dto/project-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Priority } from '../../generated/prisma/enums';
import { PublicUserDto } from '../../auth/dto/public-user.dto';

export class ProjectResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: Priority })
  priority!: Priority;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  dueDate!: Date | null;

  @ApiProperty({ format: 'uuid' })
  workspaceId!: string;

  @ApiProperty({ format: 'uuid' })
  leadId!: string;

  @ApiProperty({ type: PublicUserDto })
  lead!: PublicUserDto;

  @ApiProperty({ format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: Date;
}
