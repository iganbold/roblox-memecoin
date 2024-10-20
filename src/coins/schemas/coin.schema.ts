import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CoinDocument = HydratedDocument<Coin>;

@Schema({ timestamps: true, autoIndex: true })
export class Coin {
  @Prop()
  robloxUserId: string;

  @Prop({ unique: true })
  name: string;

  @Prop()
  description: string;

  @Prop()
  symbol: string;

  @Prop()
  chain: string;

  @Prop()
  robloxlogo: string;

  @Prop()
  coinId: string;

  @Prop()
  tokenAddress: string;

  @Prop()
  supply: string;

  @Prop()
  decimals: number;

  @Prop()
  logo: string;

  @Prop()
  buyPrice: string;

  @Prop()
  sellPrice: string;

  @Prop()
  creatorWalletAddress: string;

  @Prop()
  txHash: string;
}

export const CoinSchema = SchemaFactory.createForClass(Coin);
