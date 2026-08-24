// apps/api/src/auth/dto/public-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class PublicUserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  fullName!: string;

  @ApiProperty()
  username!: string;

  @ApiProperty()
  isGuest!: boolean;

  @ApiProperty({ type: String, nullable: true })
  avatarUrl!: string | null;
}
