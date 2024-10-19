// src/wallets/dto/create-wallet.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateWalletDto {
  @IsString()
  @IsNotEmpty()
  robloxUserId: string;
}
