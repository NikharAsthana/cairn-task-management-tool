// apps/api/src/auth/dto/exchange-token.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ExchangeTokenDto {
  @ApiProperty({
    description: 'Short-lived token issued by the OAuth callback redirect',
  })
  @IsString()
  @IsNotEmpty()
  token!: string;
}
