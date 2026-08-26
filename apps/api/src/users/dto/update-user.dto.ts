// apps/api/src/users/dto/update-user.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Dexter', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fullName?: string;

  @ApiPropertyOptional({ example: 'Designer', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional({ example: 'dexuser', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  username?: string;
}
