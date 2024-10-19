import { Injectable, Query } from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { Wallet } from './schemas/wallet.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { GetWalletsQueryDto } from './dto/get-wallets-query.dto';

@Injectable()
export class WalletsService {
  private readonly apiUrl: string;
  private readonly authToken: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectModel(Wallet.name)
    private walletModel: Model<Wallet>,
  ) {
    this.apiUrl = this.configService.get<string>('THIRDWEB_API_URL');
    this.authToken = this.configService.get<string>('AUTH_TOKEN');
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

      // If not found, create a new wallet
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.apiUrl}/backend-wallet/create`,
          {},
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: this.authToken,
            },
          },
        ),
      );

      const user = new this.walletModel({
        walletAddress: response.data.result.walletAddress,
        robloxUserId: createWalletDto.robloxUserId,
      });

      await user.save();

      //   return response.data; // Return the response data from the API
      return user;
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw new Error('Failed to create wallet'); // Handle error appropriately
    }

    // return newWallet; // Return the created wallet
  }

  async findAll(@Query() queryDto: GetWalletsQueryDto): Promise<Wallet[]> {
    return this.walletModel.find(queryDto).exec(); // Return all wallets
  }
}
