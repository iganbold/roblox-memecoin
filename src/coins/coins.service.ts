import { Injectable } from '@nestjs/common';
import { CreateCoinDto } from './dto/create-coin.dto';
import { ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Coin } from './schemas/coin.schema';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { GetCoinsQueryDto } from './dto/get-coins-query.dto';
import { WalletsService } from 'src/wallets/wallets.service';
import { BuyCoinDto } from './dto/buy-coin.dto';
import { Coinbase, Wallet as CoinbaseWallet } from '@coinbase/coinbase-sdk';

const COINBASE_CDP_API_PRIVATE_KEY =
  '-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEIO9fsRlRnrAA0LAy8kTAxufEmy3mAK2RQcubUtc1NMTooAoGCCqGSM49\nAwEHoUQDQgAEVJDmsXk/IoJM6OLQbA7RCkhyO6275nKM5kAhQSpO3K6kBKpfSVTT\n7FFaD2brIlmVkpepyCVxDL/107iahnJWrg==\n-----END EC PRIVATE KEY-----\n';

@Injectable()
export class CoinsService {
  private provider: ethers.providers.JsonRpcProvider;
  private signer: ethers.Wallet;
  private contract: ethers.Contract;

  private readonly coinbaseApiKeyName: string;
  private readonly coinbaseApiPrivateKey: string;
  private readonly coinbaseClient: Coinbase;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Coin.name)
    private coinModel: Model<Coin>,
    private readonly walletsService: WalletsService,
  ) {
    this.provider = new ethers.providers.JsonRpcProvider(
      this.configService.get<string>('RPC_URL'),
    );

    this.coinbaseApiKeyName = this.configService.get<string>(
      'COINBASE_CDP_API_KEY_NAME',
    );
    this.coinbaseApiPrivateKey = COINBASE_CDP_API_PRIVATE_KEY;

    this.coinbaseClient = new Coinbase({
      apiKeyName: this.coinbaseApiKeyName,
      privateKey: this.coinbaseApiPrivateKey,
    });

    Coinbase.useServerSigner = true;

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
        'function buyMeme(uint256 memeId, uint256 amount) external payable',
        'function sellMeme(uint256 memeId, uint256 amount) external',
        'function getBuyPrice(uint256 supply, uint256 amount) public view returns (uint256)',
        'function getSellPrice(uint256 supply, uint256 amount) public view returns (uint256)',
        'function getMemeSupply(uint256 memeId) public view returns (uint256)',
      ],
      this.signer,
    );

    // Listen for MemeCreated events
    this.contract.on('MemeCreated', this.handleMemeCreatedEvent.bind(this));
  }

  async createCoin(createCoinDto: CreateCoinDto): Promise<Coin> {
    const { name, symbol, chain } = createCoinDto;
    try {
      const memeCoinName = `${name}-${uuidv4()}`;

      const coin = new this.coinModel({
        robloxUserId: createCoinDto.robloxUserId,
        name: memeCoinName,
        symbol: createCoinDto.symbol,
        description: createCoinDto.description,
        chain: chain,
        robloxlogo: createCoinDto.robloxlogo,
        decimals: 18,
        supply: '0',
        logo: createCoinDto.robloxlogo,
        buyPrice: '0.000001',
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

  async buyCoin(id: string, buyCoinDto: BuyCoinDto) {
    const { robloxUserId, amount } = buyCoinDto;
    const walletData =
      await this.walletsService.getWalletByRobloxUserId(robloxUserId);
    const supply = await this.contract.getMemeSupply(id);
    const price = await this.contract.getBuyPrice(supply, amount);

    const wallet = await CoinbaseWallet.fetch(walletData.walletId);

    const address = await wallet.listAddresses();
    console.log('address', address);

    const tx = await wallet.invokeContract({
      contractAddress: '0xAB05ef04Fd20A9aefb140820C6D4E62D9426bF7E',
      method: 'buyMeme',
      args: [id, amount],
      abi: [
        {
          inputs: [
            {
              internalType: 'uint256',
              name: 'memeId',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'amount',
              type: 'uint256',
            },
          ],
          name: 'buyMeme',
          outputs: [],
          stateMutability: 'payable',
          type: 'function',
        },
      ],
      amount: 0.0001,
      assetId: Coinbase.assets.Eth,
    });

    console.log('tx', tx);

    // const tx = await this.contract.buyMeme(id, amount, { value: price });

    // const receipt = await tx.wait();

    return tx;
  }

  getBuyCoinPrice(id: string, amount: number) {
    return '';
  }
}
