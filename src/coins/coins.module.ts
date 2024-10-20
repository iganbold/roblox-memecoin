import { Module } from '@nestjs/common';
import { CoinsService } from './coins.service';
import { CoinsController } from './coins.controller';
import { Coin, CoinSchema } from './schemas/coin.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Coin.name,
        useFactory: () => {
          const schema = CoinSchema;
          return schema;
        },
      },
    ]),
  ],
  providers: [CoinsService],
  controllers: [CoinsController],
})
export class CoinsModule {}
