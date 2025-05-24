import { Network, Alchemy, AssetTransfersCategory, SortingOrder } from 'alchemy-sdk';

export class AlchemyService {
  private alchemy: Alchemy;
  
  constructor(apiKey: string, network: Network = Network.ETH_MAINNET) {
    const settings = {
      apiKey: apiKey,
      network: network,
    };
    this.alchemy = new Alchemy(settings);
  }

  // Get token balances for an address
  async getTokenBalances(address: string, contractAddresses?: string[]) {
    try {
      const balances = await this.alchemy.core.getTokenBalances(address, contractAddresses);
      return balances;
    } catch (error) {
      console.error('Error fetching token balances:', error);
      return null;
    }
  }

  // Get transaction history
  async getTransactionHistory(address: string, maxCount: number = 100) {
    try {
      const transactions = await this.alchemy.core.getAssetTransfers({
        fromAddress: address,
        toAddress: address,
        category: [
          AssetTransfersCategory.EXTERNAL,    // Fixed: use enum values
          AssetTransfersCategory.INTERNAL,
          AssetTransfersCategory.ERC20,
          AssetTransfersCategory.ERC721,
          AssetTransfersCategory.ERC1155
        ],
        maxCount: maxCount,
        order: SortingOrder.DESCENDING       // Fixed: use enum value
      });
      return transactions;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return null;
    }
  }

  // Get NFTs owned by address
  async getNFTs(address: string) {
    try {
      const nfts = await this.alchemy.nft.getNftsForOwner(address);
      return nfts;
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      return null;
    }
  }

  // Get contract metadata
  async getContractMetadata(contractAddress: string) {
    try {
      const metadata = await this.alchemy.core.getTokenMetadata(contractAddress);
      return metadata;
    } catch (error) {
      console.error('Error fetching contract metadata:', error);
      return null;
    }
  }
}
