// src/wallets/schemas/token.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Token {
  @Prop()
  tokenAddress: string;

  @Prop()
  symbol: string;

  @Prop()
  name: string;

  @Prop()
  decimals: number;

  @Prop()
  balance: string;

  @Prop()
  chain: string;

  @Prop()
  logo: string;

  @Prop()
  balanceFormatted: string;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
