import { Module } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { Wallet, WalletSchema } from './schemas/wallet.schema';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeatureAsync([
      {
        name: Wallet.name,
        useFactory: () => {
          const schema = WalletSchema;
          return schema;
        },
      },
    ]),
  ],

  providers: [WalletsService],
  controllers: [WalletsController],
})
export class WalletsModule {}
