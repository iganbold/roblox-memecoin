import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Token } from './token.schema';

export type WalletDocument = HydratedDocument<Wallet>;

@Schema({ timestamps: true, autoIndex: true })
export class Wallet {
  @Prop({ required: true, unique: true })
  walletAddress: string;

  @Prop({ required: true, unique: true })
  robloxUserId: string;

  @Prop({ default: [], type: [Token] })
  tokens: Token[];
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);
