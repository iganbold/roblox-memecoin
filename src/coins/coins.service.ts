import { Injectable } from '@nestjs/common';
import { CreateCoinDto } from './dto/create-coin.dto';
import { ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Coin } from './schemas/coin.schema';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { GetCoinsQueryDto } from './dto/get-coins-query.dto';

@Injectable()
export class CoinsService {
  private provider: ethers.providers.JsonRpcProvider;
  private signer: ethers.Wallet;
  private contract: ethers.Contract;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Coin.name)
    private coinModel: Model<Coin>,
  ) {
    this.provider = new ethers.providers.JsonRpcProvider(
      this.configService.get<string>('RPC_URL'),
    );

    // Create signer from mnemonic
    const mnemonic = this.configService.get<string>('DEPLOYER_WALLET_SEED');
    const path = "m/44'/60'/0'/0/0"; // Standard Ethereum derivation path
    this.signer = ethers.Wallet.fromMnemonic(mnemonic, path).connect(
      this.provider,
    );

    this.contract = new ethers.Contract(
      this.configService.get<string>('MEME_FACTORY_ADDRESS'),
      [
        'function createMemecoin(string memory name, string memory symbol, string memory memeUrl) external',
        'event MemeCreated(uint256 indexed memeId, address indexed creator, address memeAddress, string name, string symbol, string memeUrl)',
      ],
      this.signer,
    );

    // Listen for MemeCreated events
    this.contract.on('MemeCreated', this.handleMemeCreatedEvent.bind(this));
  }

  async createCoin(createCoinDto: CreateCoinDto): Promise<Coin> {
    const { name, symbol } = createCoinDto;
    try {
      const memeCoinName = `${name}-${uuidv4()}`;

      const coin = new this.coinModel({
        robloxUserId: createCoinDto.robloxUserId,
        name: memeCoinName,
        symbol: createCoinDto.symbol,
        description: createCoinDto.description,
        chain: createCoinDto.chain,
        robloxlogo: createCoinDto.robloxlogo,
        decimals: 18,
        supply: '0',
        logo: createCoinDto.robloxlogo,
        buyPrice: '0',
        sellPrice: '0.000001',
        tokenAddress: null,
        coinId: null,
      });

      await coin.save();

      const tx = await this.contract.createMemecoin(
        memeCoinName,
        symbol,
        'https://example.meme',
      );
      const receipt = await tx.wait();

      //   console.log('receipt', receipt);

      return coin;
    } catch (error) {
      console.error('Error creating memecoin:', error);
      throw new Error('Failed to create memecoin');
    }
  }

  private async handleMemeCreatedEvent(
    memeId: string,
    creator: string,
    memeAddress: string,
    name: string,
    symbol: string,
    memeUrl: string,
  ) {
    console.log(
      `New memecoin created: ${name} (${symbol}) ${memeAddress} ${memeId}`,
    );

    const coin = await this.coinModel.findOne({ name });

    if (coin) {
      coin.coinId = memeId;
      coin.tokenAddress = memeAddress;
      await coin.save();
    }
  }

  getCoins(queryDto: GetCoinsQueryDto) {
    const { robloxUserIds } = queryDto;

    if (robloxUserIds && robloxUserIds.length > 0) {
      return this.coinModel
        .find({ robloxUserId: { $in: robloxUserIds } })
        .exec();
    }

    return this.coinModel.find().exec();
  }
}
