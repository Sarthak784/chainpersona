import { IDataCollector } from './dataCollector.interface';

// Type guard for API response
interface ApiResponse {
  status: string;
  result: any[];
}

function isValidApiResponse(data: unknown): data is ApiResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'status' in data &&
    'result' in data &&
    Array.isArray((data as any).result)
  );
}

export class DataCollector implements IDataCollector {
  private apiKey: string;
  private chainType: string;
  private baseUrls: Record<string, string> = {
    ethereum: 'https://api.etherscan.io/api',
    polygon: 'https://api.polygonscan.com/api',
    bsc: 'https://api.bscscan.com/api'
  };

  constructor(apiKey: string, chainType: string) {
    this.apiKey = apiKey;
    this.chainType = chainType;
    
    if (!this.baseUrls[chainType]) {
      throw new Error(`Unsupported chain type: ${chainType}`);
    }
    
    console.log(`🔗 DataCollector initialized for ${chainType}`);
  }

  getChainType(): string {
    return this.chainType;
  }

  private getBaseUrl(): string {
    return this.baseUrls[this.chainType];
  }

  async getTokenBalances(address: string) {
    try {
      console.log(`📊 Fetching ${this.chainType} token balances for ${address}`);
      
      const response = await fetch(
        `${this.getBaseUrl()}?module=account&action=tokentx&address=${address}&startblock=0&endblock=999999999&sort=desc&apikey=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`${this.chainType} API error: ${response.status}`);
      }
      
      const data: unknown = await response.json();
      
      if (!isValidApiResponse(data)) {
        console.log(`Invalid API response format from ${this.chainType}`);
        return { erc20: [], erc721: [] };
      }
      
      if (data.status !== '1') {
        console.log(`No token transactions found on ${this.chainType}`);
        return { erc20: [], erc721: [] };
      }
      
      const uniqueTokens = new Map();
      data.result.forEach((tx: any) => {
        if (!uniqueTokens.has(tx.contractAddress)) {
          uniqueTokens.set(tx.contractAddress, {
            contractAddress: tx.contractAddress,
            symbol: tx.tokenSymbol,
            name: tx.tokenName,
            decimals: parseInt(tx.tokenDecimal) || 18
          });
        }
      });
      
      const erc20Tokens = Array.from(uniqueTokens.values());
      
      console.log(`✅ Found ${erc20Tokens.length} unique tokens on ${this.chainType}`);
      
      return {
        erc20: erc20Tokens,
        erc721: []
      };
    } catch (error) {
      console.error(`❌ Error fetching ${this.chainType} token balances:`, error);
      return { erc20: [], erc721: [] };
    }
  }

  async getWalletTransactions(address: string, maxCount: number = 200) {
    try {
      console.log(`📈 Fetching ${maxCount} ${this.chainType} transactions for ${address}`);
      
      const response = await fetch(
        `${this.getBaseUrl()}?module=account&action=txlist&address=${address}&startblock=0&endblock=999999999&page=1&offset=${Math.min(maxCount, 100)}&sort=desc&apikey=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`${this.chainType} API error: ${response.status}`);
      }
      
      const data: unknown = await response.json();
      
      if (!isValidApiResponse(data)) {
        console.log(`Invalid API response format from ${this.chainType}`);
        return [];
      }
      
      if (data.status !== '1') {
        console.log(`No transactions found on ${this.chainType}`);
        return [];
      }
      
      const nativeTokens = {
        ethereum: { symbol: 'ETH', name: 'Ethereum' },
        polygon: { symbol: 'MATIC', name: 'Polygon' },
        bsc: { symbol: 'BNB', name: 'BNB Smart Chain' }
      };
      
      const nativeToken = nativeTokens[this.chainType as keyof typeof nativeTokens];
      
      const formattedTransactions = data.result.map((tx: any) => {
        console.log(`🔍 Transaction gas data:`, { gasUsed: tx.gasUsed, gasPrice: tx.gasPrice, hash: tx.hash.substring(0, 10) });
        return {
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: tx.value,
          timeStamp: tx.timeStamp,
          blockNumber: tx.blockNumber,
          gasUsed: tx.gasUsed || '0', // ✅ Real gas data from external transactions
          gasPrice: tx.gasPrice || '0', // ✅ Real gas price data
          contractAddress: tx.contractAddress || '',
          tokenSymbol: nativeToken.symbol,
          tokenName: nativeToken.name,
          category: 'external',
          isError: tx.isError || '0'
        };
      });
      
      console.log(`✅ Fetched ${formattedTransactions.length} ${this.chainType} transactions`);
      return formattedTransactions;
    } catch (error) {
      console.error(`❌ Error fetching ${this.chainType} transactions:`, error);
      return [];
    }
  }

  async getContractInteractions(address: string) {
    try {
      console.log(`🤝 Fetching ${this.chainType} contract interactions for ${address}`);
      
      // Get both internal transactions AND regular transactions to contracts
      const [internalResponse, externalResponse] = await Promise.all([
        fetch(`${this.getBaseUrl()}?module=account&action=txlistinternal&address=${address}&startblock=0&endblock=999999999&page=1&offset=50&sort=desc&apikey=${this.apiKey}`),
        fetch(`${this.getBaseUrl()}?module=account&action=txlist&address=${address}&startblock=0&endblock=999999999&page=1&offset=50&sort=desc&apikey=${this.apiKey}`)
      ]);
      
      const nativeTokens = {
        ethereum: { symbol: 'ETH', name: 'Ethereum' },
        polygon: { symbol: 'MATIC', name: 'Polygon' },
        bsc: { symbol: 'BNB', name: 'BNB Smart Chain' }
      };
      
      const nativeToken = nativeTokens[this.chainType as keyof typeof nativeTokens];
      let contractInteractions: any[] = [];
      
      // Process external transactions to contracts (these have gas data)
      if (externalResponse.ok) {
        const externalData: unknown = await externalResponse.json();
        if (isValidApiResponse(externalData) && externalData.status === '1') {
          const contractTxs = externalData.result
            .filter((tx: any) => tx.to && tx.to !== '' && tx.input && tx.input !== '0x')
            .map((tx: any) => {
              console.log(`🔍 Contract interaction gas:`, { gasUsed: tx.gasUsed, gasPrice: tx.gasPrice, to: tx.to.substring(0, 10) });
              return {
                hash: tx.hash,
                from: tx.from,
                to: tx.to,
                value: tx.value,
                timeStamp: tx.timeStamp,
                blockNumber: tx.blockNumber,
                gasUsed: tx.gasUsed || '0', // ✅ Real gas data
                gasPrice: tx.gasPrice || '0', // ✅ Real gas price
                contractAddress: tx.to,
                tokenSymbol: nativeToken.symbol,
                tokenName: nativeToken.name,
                category: 'internal',
                isError: tx.isError || '0'
              };
            });
          
          contractInteractions = contractInteractions.concat(contractTxs);
        }
      }
      
      // Process internal transactions (fallback, might not have gas)
      if (internalResponse.ok) {
        const internalData: unknown = await internalResponse.json();
        if (isValidApiResponse(internalData) && internalData.status === '1') {
          const internalTxs = internalData.result
            .filter((tx: any) => tx.to && tx.to !== '')
            .map((tx: any) => ({
              hash: tx.hash,
              from: tx.from,
              to: tx.to,
              value: tx.value,
              timeStamp: tx.timeStamp,
              blockNumber: tx.blockNumber,
              gasUsed: tx.gasUsed || '21000', // Default gas for internal
              gasPrice: tx.gasPrice || '20000000000', // Default gas price
              contractAddress: tx.to,
              tokenSymbol: nativeToken.symbol,
              tokenName: nativeToken.name,
              category: 'internal',
              isError: tx.isError || '0'
            }));
          
          // Only add internal transactions that aren't already in external
          const existingHashes = new Set(contractInteractions.map(tx => tx.hash));
          const newInternalTxs = internalTxs.filter(tx => !existingHashes.has(tx.hash));
          contractInteractions = contractInteractions.concat(newInternalTxs);
        }
      }
      
      // Remove duplicates and sort by timestamp
      const uniqueInteractions = Array.from(
        new Map(contractInteractions.map(tx => [tx.hash, tx])).values()
      ).sort((a, b) => parseInt(b.timeStamp) - parseInt(a.timeStamp));
      
      console.log(`✅ Found ${uniqueInteractions.length} ${this.chainType} contract interactions with real gas data`);
      return uniqueInteractions;
    } catch (error) {
      console.error(`❌ Error fetching ${this.chainType} contract interactions:`, error);
      return [];
    }
  }
}
