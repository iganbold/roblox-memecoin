import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class GetCoinsQueryDto {
  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true }) // Validate each item in the array as a string
  robloxUserIds: string[]; // Change to an array of strings
}
