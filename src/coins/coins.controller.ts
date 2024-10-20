import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CoinsService } from './coins.service';
import { CreateCoinDto } from './dto/create-coin.dto';
import { ApiTags } from '@nestjs/swagger';
import { GetCoinsQueryDto } from './dto/get-coins-query.dto';

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
}
