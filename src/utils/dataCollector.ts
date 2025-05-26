import { IDataCollector } from './dataCollector.interface';

interface ApiResponse {
  status: string;
  result: any;
  data?: any;
}

interface CoinbaseResponse {
  data: {
    rates: {
      USD: string;
    };
  };
}

function isValidApiResponse(data: unknown): data is ApiResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'status' in data &&
    'result' in data
  );
}

function isValidCoinbaseResponse(data: unknown): data is CoinbaseResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'data' in data &&
    typeof (data as any).data === 'object' &&
    (data as any).data !== null &&
    'rates' in (data as any).data &&
    typeof (data as any).data.rates === 'object' &&
    (data as any).data.rates !== null &&
    'USD' in (data as any).data.rates
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

  // NEW: Get real portfolio value using Coinbase API (free)
  async getRealPortfolioValue(address: string): Promise<number> {
    try {
      console.log(`💰 Calculating real portfolio value for ${address}`);
      
      // Get token balances
      const tokenBalances = await this.getTokenBalances(address);
      const erc20Tokens = tokenBalances.erc20 || [];
      
      let totalValue = 0;
      
      // Get ETH balance first
      const ethValue = await this.getETHBalance(address);
      totalValue += ethValue;
      
      // Get major token prices (top tokens only to avoid API spam)
      const majorTokens = this.getMajorTokens(erc20Tokens);
      
      for (const token of majorTokens) {
        try {
          const price = await this.getTokenPrice(token.symbol);
          const balance = parseFloat(token.balance || '0') / Math.pow(10, token.decimals);
          const tokenValue = balance * price;
          totalValue += tokenValue;
          
          console.log(`💎 ${token.symbol}: ${balance.toFixed(4)} × $${price} = $${tokenValue.toFixed(2)}`);
        } catch (error) {
          console.log(`⚠️ Could not get price for ${token.symbol}`);
        }
      }
      
      console.log(`✅ Total portfolio value: $${totalValue.toFixed(2)}`);
      return totalValue;
      
    } catch (error) {
      console.error('❌ Error calculating portfolio value:', error);
      return 0;
    }
  }

  // Get ETH balance in USD
  private async getETHBalance(address: string): Promise<number> {
    try {
      const response = await fetch(
        `${this.getBaseUrl()}?module=account&action=balance&address=${address}&tag=latest&apikey=${this.apiKey}`
      );
      
      const data: unknown = await response.json();
      
      if (!isValidApiResponse(data)) {
        console.log(`Invalid API response format from ${this.chainType}`);
        return 0;
      }

      if (data.status === '1') {
        const ethBalance = parseFloat(data.result) / Math.pow(10, 18);
        const ethPrice = await this.getTokenPrice('ETH');
        const ethValue = ethBalance * ethPrice;
        
        console.log(`⟠ ETH: ${ethBalance.toFixed(4)} × $${ethPrice} = $${ethValue.toFixed(2)}`);
        return ethValue;
      }
      return 0;
    } catch (error) {
      console.error('Error getting ETH balance:', error);
      return 0;
    }
  }

  // Filter to major tokens only (to avoid too many API calls)
  private getMajorTokens(tokens: any[]): any[] {
    const majorSymbols = ['USDC', 'USDT', 'DAI', 'WETH', 'UNI', 'LINK', 'AAVE', 'COMP', 'MKR', 'MATIC', 'BNB'];
    return tokens.filter(token => majorSymbols.includes(token.symbol)).slice(0, 5); // Max 5 tokens
  }

  // Get token price from Coinbase (free API)
  private async getTokenPrice(symbol: string): Promise<number> {
    try {
      // Map symbols to Coinbase format
      const symbolMap: Record<string, string> = {
        'ETH': 'ETH',
        'WETH': 'ETH',
        'USDC': 'USDC',
        'USDT': 'USDT',
        'DAI': 'DAI',
        'UNI': 'UNI',
        'LINK': 'LINK',
        'AAVE': 'AAVE',
        'COMP': 'COMP',
        'MKR': 'MKR',
        'MATIC': 'MATIC',
        'BNB': 'BNB'
      };

      const coinbaseSymbol = symbolMap[symbol] || symbol;
      
      const response = await fetch(
        `https://api.coinbase.com/v2/exchange-rates?currency=${coinbaseSymbol}`
      );
      
      const data: unknown = await response.json();

      if (isValidCoinbaseResponse(data)) {
        return parseFloat(data.data.rates.USD);
      }
      
      throw new Error(`Price not found for ${symbol}`);
    } catch (error) {
      console.log(`Could not get price for ${symbol}, using fallback`);
      // Fallback prices for major tokens
      const fallbackPrices: Record<string, number> = {
        'ETH': 2500,
        'WETH': 2500,
        'USDC': 1,
        'USDT': 1,
        'DAI': 1,
        'UNI': 8,
        'LINK': 15,
        'AAVE': 100,
        'COMP': 50,
        'MKR': 1200,
        'MATIC': 0.8,
        'BNB': 300
      };
      return fallbackPrices[symbol] || 0;
    }
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
      
      // Calculate actual balances from transactions
      const balanceMap = new Map();
      
      data.result.forEach((tx: any) => {
        const contractAddress = tx.contractAddress.toLowerCase();
        const value = parseFloat(tx.value || '0');
        const isIncoming = tx.to.toLowerCase() === address.toLowerCase();
        
        if (!balanceMap.has(contractAddress)) {
          balanceMap.set(contractAddress, {
            contractAddress: tx.contractAddress,
            symbol: tx.tokenSymbol,
            name: tx.tokenName,
            decimals: parseInt(tx.tokenDecimal) || 18,
            balance: '0'
          });
        }
        
        const token = balanceMap.get(contractAddress);
        const currentBalance = parseFloat(token.balance);
        token.balance = (currentBalance + (isIncoming ? value : -value)).toString();
      });
      
      // Filter tokens with positive balances
      const erc20Tokens = Array.from(balanceMap.values()).filter(
        token => parseFloat(token.balance) > 0
      );
      
      console.log(`✅ Found ${erc20Tokens.length} tokens with positive balances on ${this.chainType}`);
      
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
      
      // Fetch both regular transactions and token transfers
      const [regularResponse, tokenResponse] = await Promise.all([
        fetch(`${this.getBaseUrl()}?module=account&action=txlist&address=${address}&startblock=0&endblock=999999999&page=1&offset=${Math.min(maxCount, 100)}&sort=desc&apikey=${this.apiKey}`),
        fetch(`${this.getBaseUrl()}?module=account&action=tokentx&address=${address}&startblock=0&endblock=999999999&page=1&offset=50&sort=desc&apikey=${this.apiKey}`)
      ]);
      
      const nativeTokens = {
        ethereum: { symbol: 'ETH', name: 'Ethereum' },
        polygon: { symbol: 'MATIC', name: 'Polygon' },
        bsc: { symbol: 'BNB', name: 'BNB Smart Chain' }
      };
      
      const nativeToken = nativeTokens[this.chainType as keyof typeof nativeTokens];
      let allTransactions: any[] = [];
      
      // Process regular transactions
      if (regularResponse.ok) {
        const regularData: unknown = await regularResponse.json();
        if (isValidApiResponse(regularData) && regularData.status === '1') {
          const formattedTransactions = regularData.result.map((tx: any) => {
            console.log(`🔍 Regular transaction gas data:`, { gasUsed: tx.gasUsed, gasPrice: tx.gasPrice, hash: tx.hash.substring(0, 10) });
            return {
              hash: tx.hash,
              from: tx.from,
              to: tx.to,
              value: tx.value,
              timeStamp: tx.timeStamp,
              blockNumber: tx.blockNumber,
              gasUsed: tx.gasUsed || '0',
              gasPrice: tx.gasPrice || '0',
              contractAddress: tx.contractAddress || '',
              tokenSymbol: nativeToken.symbol,
              tokenName: nativeToken.name,
              tokenDecimal: '18',
              category: 'external',
              isError: tx.isError || '0'
            };
          });
          allTransactions = allTransactions.concat(formattedTransactions);
        }
      }
      
      // Process token transfers
      if (tokenResponse.ok) {
        const tokenData: unknown = await tokenResponse.json();
        if (isValidApiResponse(tokenData) && tokenData.status === '1') {
          const tokenTransactions = tokenData.result.map((tx: any) => ({
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: tx.value,
            timeStamp: tx.timeStamp,
            blockNumber: tx.blockNumber,
            gasUsed: tx.gasUsed || '21000',
            gasPrice: tx.gasPrice || '20000000000',
            contractAddress: tx.contractAddress,
            tokenSymbol: tx.tokenSymbol || 'TOKEN',
            tokenName: tx.tokenName || 'Unknown Token',
            tokenDecimal: tx.tokenDecimal || '18',
            category: 'erc20',
            isError: '0'
          }));
          allTransactions = allTransactions.concat(tokenTransactions);
        }
      }
      
      // Remove duplicates and sort by timestamp
      const uniqueTransactions = Array.from(
        new Map(allTransactions.map(tx => [tx.hash, tx])).values()
      ).sort((a, b) => parseInt(b.timeStamp) - parseInt(a.timeStamp));
      
      console.log(`✅ Fetched ${uniqueTransactions.length} total transactions (${allTransactions.filter(tx => tx.category === 'external').length} regular, ${allTransactions.filter(tx => tx.category === 'erc20').length} token)`);
      return uniqueTransactions;
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
                gasUsed: tx.gasUsed || '0',
                gasPrice: tx.gasPrice || '0',
                contractAddress: tx.to,
                tokenSymbol: nativeToken.symbol,
                tokenName: nativeToken.name,
                tokenDecimal: '18',
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
              gasUsed: tx.gasUsed || '21000',
              gasPrice: tx.gasPrice || '20000000000',
              contractAddress: tx.to,
              tokenSymbol: nativeToken.symbol,
              tokenName: nativeToken.name,
              tokenDecimal: '18',
              category: 'internal',
              isError: tx.isError || '0'
            }));
          
          // Only add internal transactions that aren't already in external
          const existingHashes = new Set(contractInteractions.map(tx => tx.hash));
          const newInternalTxs = internalTxs.filter((tx: any) => !existingHashes.has(tx.hash));
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
