import { Injectable, Query } from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Wallet } from './schemas/wallet.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { GetWalletsQueryDto } from './dto/get-wallets-query.dto';
import { Coinbase, Wallet as CoinbaseWallet } from '@coinbase/coinbase-sdk';

const COINBASE_CDP_API_PRIVATE_KEY =
  '-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEIO9fsRlRnrAA0LAy8kTAxufEmy3mAK2RQcubUtc1NMTooAoGCCqGSM49\nAwEHoUQDQgAEVJDmsXk/IoJM6OLQbA7RCkhyO6275nKM5kAhQSpO3K6kBKpfSVTT\n7FFaD2brIlmVkpepyCVxDL/107iahnJWrg==\n-----END EC PRIVATE KEY-----\n';

@Injectable()
export class WalletsService {
  //   private readonly apiUrl: string;
  //   private readonly authToken: string;
  private readonly coinbaseApiKeyName: string;
  private readonly coinbaseApiPrivateKey: string;
  private readonly coinbaseClient: Coinbase;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectModel(Wallet.name)
    private walletModel: Model<Wallet>,
  ) {
    // this.apiUrl = this.configService.get<string>('THIRDWEB_API_URL');
    // this.authToken = this.configService.get<string>('AUTH_TOKEN');

    this.coinbaseApiKeyName = this.configService.get<string>(
      'COINBASE_CDP_API_KEY_NAME',
    );
    // this.coinbaseApiPrivateKey = this.configService.get<string>(
    //   'COINBASE_CDP_API_PRIVATE_KEY',
    // );
    this.coinbaseApiPrivateKey = COINBASE_CDP_API_PRIVATE_KEY;

    this.coinbaseClient = new Coinbase({
      apiKeyName: this.coinbaseApiKeyName,
      privateKey: this.coinbaseApiPrivateKey,
    });

    Coinbase.useServerSigner = true;
  }

  async create(createWalletDto: CreateWalletDto) {
    try {
      // Check if a wallet with the given Roblox user ID exists
      const existingWallet = await this.walletModel
        .findOne({ robloxUserId: createWalletDto.robloxUserId })
        .exec();

      if (existingWallet) {
        return existingWallet; // Return the existing wallet if found
      }

      // Create coinbase wallet
      const wallet = await CoinbaseWallet.create();

      // Fund your wallet using a faucet.
      await wallet.faucet();
      await wallet.faucet(Coinbase.assets.Usdc);

      //   const balances = await wallet.listBalances();

      console.log(wallet);

      const user = new this.walletModel({
        walletAddress: wallet['model'].default_address.address_id,
        walletId: wallet['model'].id,
        robloxUserId: createWalletDto.robloxUserId,
        tokens: [
          {
            tokenAddress: '0x0000000000000000000000000000000000000000',
            symbol: 'ETH',
            name: 'Ether',
            decimals: 18,
            balance: '10000000000000000',
            chain: Coinbase.networks.BaseSepolia,
            logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1796501428',
            balanceFormatted: '0.01',
          },
        ],
      });

      await user.save();

      return user;
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw new Error('Failed to create wallet');
    }
  }

  async findAll(@Query() queryDto: GetWalletsQueryDto): Promise<Wallet[]> {
    const { robloxUserIds } = queryDto;

    if (robloxUserIds && robloxUserIds.length > 0) {
      return this.walletModel
        .find({ robloxUserId: { $in: robloxUserIds } })
        .exec();
    }

    return this.walletModel.find().exec();
  }

  async getWalletByRobloxUserId(robloxUserId: string) {
    return this.walletModel.findOne({ robloxUserId: robloxUserId }).exec();
  }
}
