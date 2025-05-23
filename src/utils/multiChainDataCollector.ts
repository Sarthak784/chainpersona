import { ethers } from 'ethers';
import axios from 'axios';
import { IDataCollector } from './dataCollector.interface';

export class MultiChainDataCollector implements IDataCollector {
  private provider: ethers.providers.JsonRpcProvider;
  private apiKeys: Record<string, string>;
  private chainType: string;

  constructor(
    chainType: string = 'ethereum',
    providerUrl: string,
    apiKeys: Record<string, string> = {}
  ) {
    this.chainType = chainType;
    this.apiKeys = apiKeys;
    this.provider = new ethers.providers.JsonRpcProvider(providerUrl);
  }

  getChainType(): string {
    return this.chainType;
  }

  async getWalletTransactions(address: string, limit: number = 100): Promise<any[]> {
    try {
      if (this.chainType === 'ethereum') {
        return this.getEthereumTransactions(address, limit);
      } else if (this.chainType === 'polygon') {
        return this.getPolygonTransactions(address, limit);
      } else if (this.chainType === 'bsc') {
        return this.getBscTransactions(address, limit);
      }
      return this.getEthereumTransactions(address, limit);
    } catch (error) {
      console.error(`Error fetching ${this.chainType} transactions:`, error);
      return [];
    }
  }

  private async getEthereumTransactions(address: string, limit: number): Promise<any[]> {
    if (this.apiKeys.etherscan) {
      const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${this.apiKeys.etherscan}`;
      const response = await axios.get(url);
      if (Array.isArray(response.data.result)) {
        return response.data.result.slice(0, limit);
      } else {
        return [];
      }
    } else {
      console.warn('No Etherscan API key provided. Limited transaction history available.');
      return [];
    }
  }

  private async getPolygonTransactions(address: string, limit: number): Promise<any[]> {
    if (this.apiKeys.polygonscan) {
      const url = `https://api.polygonscan.com/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${this.apiKeys.polygonscan}`;
      const response = await axios.get(url);
      if (Array.isArray(response.data.result)) {
        return response.data.result.slice(0, limit);
      } else {
        return [];
      }
    } else {
      console.warn('No Polygonscan API key provided. Limited transaction history available.');
      return [];
    }
  }

  private async getBscTransactions(address: string, limit: number): Promise<any[]> {
    if (this.apiKeys.bscscan) {
      const url = `https://api.bscscan.com/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${this.apiKeys.bscscan}`;
      const response = await axios.get(url);
      if (Array.isArray(response.data.result)) {
        return response.data.result.slice(0, limit);
      } else {
        return [];
      }
    } else {
      console.warn('No BscScan API key provided. Limited transaction history available.');
      return [];
    }
  }

  async getTokenBalances(address: string): Promise<any> {
    try {
      if (this.chainType === 'ethereum') {
        return this.getEthereumTokenBalances(address);
      } else if (this.chainType === 'polygon') {
        return this.getPolygonTokenBalances(address);
      } else if (this.chainType === 'bsc') {
        return this.getBscTokenBalances(address);
      }
      return this.getEthereumTokenBalances(address);
    } catch (error) {
      console.error(`Error fetching ${this.chainType} token balances:`, error);
      return { erc20: [], erc721: [] };
    }
  }

  private async getEthereumTokenBalances(address: string): Promise<any> {
    if (this.apiKeys.etherscan) {
      const erc20Url = `https://api.etherscan.io/api?module=account&action=tokenlist&address=${address}&apikey=${this.apiKeys.etherscan}`;
      const erc20Response = await axios.get(erc20Url);
      const erc721Url = `https://api.etherscan.io/api?module=account&action=tokennfttx&address=${address}&apikey=${this.apiKeys.etherscan}`;
      const erc721Response = await axios.get(erc721Url);
      return {
        erc20: Array.isArray(erc20Response.data.result) ? erc20Response.data.result : [],
        erc721: Array.isArray(erc721Response.data.result) ? erc721Response.data.result : []
      };
    } else {
      const balance = await this.provider.getBalance(address);
      return {
        nativeBalance: ethers.utils.formatEther(balance),
        erc20: [],
        erc721: []
      };
    }
  }

  private async getPolygonTokenBalances(address: string): Promise<any> {
    if (this.apiKeys.polygonscan) {
      const erc20Url = `https://api.polygonscan.com/api?module=account&action=tokenlist&address=${address}&apikey=${this.apiKeys.polygonscan}`;
      const erc20Response = await axios.get(erc20Url);
      const erc721Url = `https://api.polygonscan.com/api?module=account&action=tokennfttx&address=${address}&apikey=${this.apiKeys.polygonscan}`;
      const erc721Response = await axios.get(erc721Url);
      return {
        erc20: Array.isArray(erc20Response.data.result) ? erc20Response.data.result : [],
        erc721: Array.isArray(erc721Response.data.result) ? erc721Response.data.result : []
      };
    } else {
      const balance = await this.provider.getBalance(address);
      return {
        nativeBalance: ethers.utils.formatEther(balance),
        erc20: [],
        erc721: []
      };
    }
  }

  private async getBscTokenBalances(address: string): Promise<any> {
    if (this.apiKeys.bscscan) {
      const erc20Url = `https://api.bscscan.com/api?module=account&action=tokenlist&address=${address}&apikey=${this.apiKeys.bscscan}`;
      const erc20Response = await axios.get(erc20Url);
      const erc721Url = `https://api.bscscan.com/api?module=account&action=tokennfttx&address=${address}&apikey=${this.apiKeys.bscscan}`;
      const erc721Response = await axios.get(erc721Url);
      return {
        erc20: Array.isArray(erc20Response.data.result) ? erc20Response.data.result : [],
        erc721: Array.isArray(erc721Response.data.result) ? erc721Response.data.result : []
      };
    } else {
      const balance = await this.provider.getBalance(address);
      return {
        nativeBalance: ethers.utils.formatEther(balance),
        erc20: [],
        erc721: []
      };
    }
  }

  async getContractInteractions(address: string, limit: number = 100): Promise<any[]> {
    try {
      const transactions = await this.getWalletTransactions(address, limit);
      if (!Array.isArray(transactions)) {
        console.warn('Transactions is not an array, returning empty array');
        return [];
      }
      return transactions.filter((tx: any) => 
        tx.input && tx.input !== '0x' && tx.input !== '0x0'
      );
    } catch (error) {
      console.error(`Error fetching ${this.chainType} contract interactions:`, error);
      return [];
    }
  }
}
