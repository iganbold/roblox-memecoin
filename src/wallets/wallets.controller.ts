import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetWalletsQueryDto } from './dto/get-wallets-query.dto';

@ApiTags('wallets')
@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new wallet' }) // Summary for Swagger UI
  @ApiResponse({
    status: 201,
    description: 'The wallet has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  create(@Body() createWalletDto: CreateWalletDto) {
    return this.walletsService.create(createWalletDto);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Return all wallets.' })
  findAll(@Query() queryDto: GetWalletsQueryDto) {
    return this.walletsService.findAll(queryDto);
  }
}
