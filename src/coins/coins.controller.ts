import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CoinsService } from './coins.service';
import { CreateCoinDto } from './dto/create-coin.dto';
import { ApiTags } from '@nestjs/swagger';
import { GetCoinsQueryDto } from './dto/get-coins-query.dto';
import { BuyCoinDto } from './dto/buy-coin.dto';

@ApiTags('coins')
@Controller('coins')
export class CoinsController {
  constructor(private readonly coinsService: CoinsService) {}

  @Post()
  createCoin(@Body() createCoinDto: CreateCoinDto) {
    return this.coinsService.createCoin(createCoinDto);
  }

  @Get()
  getCoins(@Query() queryDto: GetCoinsQueryDto) {
    return this.coinsService.getCoins(queryDto);
  }

  @Post(':id/buy')
  buyCoin(@Param('id') id: string, @Body() buyCoinDto: BuyCoinDto) {
    return this.coinsService.buyCoin(id, buyCoinDto);
  }

  getBuyCoinPrice(@Param('id') id: string, @Query('amount') amount: number) {
    return this.coinsService.getBuyCoinPrice(id, amount);
  }
}
