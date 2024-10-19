import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GetWalletsQueryDto {
  @ApiPropertyOptional()
  @IsString()
  robloxUserId: string;
}
