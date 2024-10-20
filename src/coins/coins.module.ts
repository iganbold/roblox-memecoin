import { Module } from '@nestjs/common';
import { CoinsService } from './coins.service';
import { CoinsController } from './coins.controller';

@Module({
  providers: [CoinsService],
  controllers: [CoinsController]
})
export class CoinsModule {}
