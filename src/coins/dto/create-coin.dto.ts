// src/wallets/dto/create-wallet.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCoinDto {
  @IsString()
  robloxUserId: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  symbol: string;

  @IsString()
  chain: string;

  @IsString()
  robloxlogo: string;

  @IsString()
  creatorWalletAddress: string;
}
