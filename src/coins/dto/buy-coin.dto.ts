// src/wallets/dto/create-wallet.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class BuyCoinDto {
  @IsString()
  robloxUserId: string;

  @IsString()
  amount: string;
}
