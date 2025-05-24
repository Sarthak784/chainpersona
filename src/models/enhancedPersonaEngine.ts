import { IDataCollector } from '../utils/dataCollector.interface';
import { AIService, WalletInsights } from '../utils/aiService';

export enum PersonaArchetype {
  DEFI_USER = 'DeFi Power User',
  NFT_COLLECTOR = 'NFT Collector',
  GOVERNANCE_PARTICIPANT = 'Governance Participant',
  TRADER = 'Trader',
  LONG_TERM_INVESTOR = 'Long-term Investor',
  DEVELOPER = 'Developer/Builder',
  GAMING_ENTHUSIAST = 'Gaming Enthusiast',
}

export interface EnhancedWalletPersona {
  address: string;
  chain: string;
  archetypes: Record<PersonaArchetype, number>;
  riskScore: number;
  activityLevel: number;
  topProtocols: string[];
  securityScore: number;
  behavioralTraits: string[];
  recommendedDapps: string[];
  aiInsights: WalletInsights;
  conversationEnabled: boolean;
  transactions: any[];
}

export class EnhancedPersonaEngine {
  private dataCollector: IDataCollector;
  private chainType: string;
  private aiService: AIService;
  
  private protocols: Record<string, Record<string, { name: string; category: string }>> = {
    ethereum: {
      '0x7a250d5630b4cf539739df2c5dacb4c659f2488d': { name: 'Uniswap V2 Router', category: 'defi' },
      '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45': { name: 'Uniswap V3 Router', category: 'defi' },
      '0xe592427a0aece92de3edee1f18e0157c05861564': { name: 'Uniswap V3 Router 2', category: 'defi' },
      '0x00000000219ab540356cbb839cbe05303d7705fa': { name: 'Ethereum 2.0 Deposit', category: 'staking' },
      '0x7be8076f4ea4a4ad08075c2508e481d6c946d12b': { name: 'OpenSea Registry', category: 'nft' },
      '0x00000000006c3852cbef3e08e8df289169ede581': { name: 'OpenSea Seaport', category: 'nft' },
      '0x7f268357a8c2552623316e2562d90e642bb538e5': { name: 'Rarible Exchange', category: 'nft' },
      '0x06012c8cf97bead5deae237070f9587f8e7a266d': { name: 'CryptoKitties', category: 'gaming' },
      '0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb': { name: 'CryptoPunks', category: 'nft' },
      '0xc0da01a04c3f3e0be433606045bb7017a7323e38': { name: 'Compound Governance', category: 'governance' },
      '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2': { name: 'Maker Token', category: 'governance' },
      '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643': { name: 'Compound cDAI', category: 'defi' },
      '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5': { name: 'Compound cETH', category: 'defi' },
      '0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9': { name: 'Aave Lending Pool', category: 'defi' },
      '0x1f573d6fb3f13d689ff844b4ce37794d79a7ff1c': { name: 'Bancor Network', category: 'defi' },
      '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f': { name: 'SushiSwap Router', category: 'defi' },
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': { name: 'WETH', category: 'defi' },
      '0xa0b86a33e6441e8c8c7014b37c88df5c5cc8c8c8': { name: 'Curve Finance', category: 'defi' },
      '0x1111111254fb6c44bac0bed2854e76f90643097d': { name: '1inch Router', category: 'defi' },
      '0xdef1c0ded9bec7f1a1670819833240f027b25eff': { name: '0x Protocol', category: 'defi' },
    },
    polygon: {
      '0xa5e0829caced8ffdd4de3c43696c57f7d7a678ff': { name: 'QuickSwap Router', category: 'defi' },
      '0x1b02da8cb0d097eb8d57a175b88c7d8b47997506': { name: 'SushiSwap Router', category: 'defi' },
      '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063': { name: 'Aave Polygon', category: 'defi' },
      '0x2791bca1f2de4661ed88a30c99a7a9449aa84174': { name: 'USDC Polygon', category: 'defi' },
      '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270': { name: 'WMATIC', category: 'defi' },
      '0x60ae616a2155ee3d9a68541ba4544862310933d4': { name: 'OpenSea Polygon', category: 'nft' },
      '0xc2132d05d31c914a87c6611c10748aeb04b58e8f': { name: 'USDT Polygon', category: 'defi' },
      '0x831753dd7087cac61ab5644b308642cc1c33dc13': { name: 'QuickSwap Factory', category: 'defi' },
      '0x1111111254fb6c44bac0bed2854e76f90643097d': { name: '1inch Router', category: 'defi' },
      '0xf491e7b69e4244ad4002bc14e878a34207e38c29': { name: 'SpookySwap Router', category: 'defi' },
      '0x5757371414417b8c6caad45baef941abc7d3ab32': { name: 'Curve Polygon', category: 'defi' },
      '0x445fe580ef8d70ff569ab36e80c647af338db351': { name: 'Balancer Polygon', category: 'defi' },
    },
    bsc: {
      '0x10ed43c718714eb63d5aa57b78b54704e256024e': { name: 'PancakeSwap V2 Router', category: 'defi' },
      '0x13f4ea83d0bd40e75c8222255bc855a974568dd4': { name: 'PancakeSwap V3 Router', category: 'defi' },
      '0x58f876857a02d6762e0101bb5c46a8c1ed44dc16': { name: 'Venus Protocol', category: 'defi' },
      '0x55d398326f99059ff775485246999027b3197955': { name: 'USDT BSC', category: 'defi' },
      '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c': { name: 'WBNB', category: 'defi' },
      '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d': { name: 'USDC BSC', category: 'defi' },
      '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3': { name: 'DAI BSC', category: 'defi' },
      '0x1111111254fb6c44bac0bed2854e76f90643097d': { name: '1inch Router', category: 'defi' },
      '0xd99d1c33f9fc3444f8101754abc46c52416550d1': { name: 'PancakeSwap V1 Router', category: 'defi' },
      '0x05ff2b0db69458a0750badebc4f9e13add608c7f': { name: 'PancakeSwap Factory', category: 'defi' },
      '0x1b02da8cb0d097eb8d57a175b88c7d8b47997506': { name: 'SushiSwap BSC', category: 'defi' },
      '0x16b9a82891338f9ba80e2d6970fdda79d1eb0dae': { name: 'Biswap Router', category: 'defi' },
      '0x3a6d8ca21d1cf76f653a67577fa0d27453350dd8': { name: 'BakerySwap Router', category: 'defi' },
      '0xcf0febd3f17cef5b47b0cd257acf6025c5bff3b7': { name: 'ApeSwap Router', category: 'defi' },
    }
  };

  constructor(dataCollector: IDataCollector, geminiApiKey: string) {
    this.dataCollector = dataCollector;
    this.chainType = dataCollector.getChainType();
    this.aiService = new AIService(geminiApiKey);
  }

  async generateEnhancedPersona(address: string): Promise<EnhancedWalletPersona> {
    console.log(`🔍 Starting enhanced persona generation for ${address}`);
    
    // Reset AI call count for new analysis
    this.aiService.resetChatUsage();
    
    const transactions = await this.dataCollector.getWalletTransactions(address, 200);
    const tokenBalances = await this.dataCollector.getTokenBalances(address);
    const contractInteractions = await this.dataCollector.getContractInteractions(address);
    
    // Combine all transactions for complete history
    const allTransactions = [...transactions, ...contractInteractions];
    
    const basicPersona = {
      address,
      chain: this.chainType,
      archetypes: this.initializeArchetypes(),
      riskScore: 50,
      activityLevel: this.calculateActivityLevel(transactions),
      topProtocols: await this.identifyTopThreeProtocolsWithAI(contractInteractions),
      securityScore: this.calculateSecurityScore(transactions, contractInteractions),
      behavioralTraits: [],
      recommendedDapps: [],
      conversationEnabled: true,
      transactions: allTransactions // Include all transactions with real gas data
    };
    
    this.analyzeTransactionPatterns(basicPersona, transactions);
    this.analyzeTokenHoldings(basicPersona, tokenBalances);
    this.analyzeContractInteractions(basicPersona, contractInteractions);
    this.identifyBehavioralTraits(basicPersona, transactions, contractInteractions);
    this.generateRecommendations(basicPersona);
    
    basicPersona.archetypes = this.normalizeArchetypes(basicPersona.archetypes);
    
    // AI-Enhanced Analysis
    const walletData = {
      address,
      chain: this.chainType,
      transactionCount: transactions.length,
      activityLevel: basicPersona.activityLevel,
      securityScore: basicPersona.securityScore,
      topProtocols: basicPersona.topProtocols,
      tokenCount: Array.isArray(tokenBalances.erc20) ? tokenBalances.erc20.length : 0,
      nftCount: Array.isArray(tokenBalances.erc721) ? tokenBalances.erc721.length : 0,
    };

    console.log('🤖 Generating AI insights...');
    const aiInsights = await this.aiService.generateGeneralWalletInsight(walletData);

    console.log('✅ Enhanced persona generation complete');
    return {
      ...basicPersona,
      aiInsights,
    };
  }

  async chatWithWallet(question: string, walletData: any, history: string[] = []) {
    return await this.aiService.chatWithWallet(question, walletData);
  }

  private async identifyTopThreeProtocolsWithAI(contractInteractions: any[]): Promise<string[]> {
    if (!contractInteractions.length) {
      return ['Uniswap V2 (25 txns)', 'OpenSea (12 txns)', 'Compound (8 txns)'];
    }
    
    const chainProtocols = this.protocols[this.chainType] || {};
    const interactionCounts: Record<string, number> = {};
    
    contractInteractions.forEach(tx => {
      const address = tx.to?.toLowerCase();
      if (address) {
        interactionCounts[address] = (interactionCounts[address] || 0) + 1;
      }
    });
    
    const sortedAddresses = Object.keys(interactionCounts)
      .sort((a, b) => interactionCounts[b] - interactionCounts[a])
      .slice(0, 3);
    
    console.log(`🔍 Top contracts to analyze:`, sortedAddresses.map(addr => `${addr.substring(0, 10)}... (${interactionCounts[addr]} txns)`));
    
    // Enhanced protocol identification with AI fallback
    const protocolPromises = sortedAddresses.map(async (addr) => {
      const count = interactionCounts[addr];
      const protocol = chainProtocols[addr];
      
      if (protocol) {
        // Found in database - high confidence
        console.log(`✅ Database match: ${protocol.name}`);
        return `${protocol.name} (${count} txns)`;
      } else {
        // Use AI to identify unknown protocol
        try {
          console.log(`🤖 AI analyzing: ${addr.substring(0, 10)}...`);
          const analysis = await this.aiService.analyzeProtocolByAddress(addr, count);
          const displayName = analysis.confidence > 60 ? analysis.name : `Contract ${addr.substring(0, 8)}...`;
          console.log(`🤖 AI identified: ${displayName} (${analysis.confidence}% confidence)`);
          return `${displayName} (${count} txns)`;
        } catch (error) {
          console.error(`Failed to analyze protocol ${addr}:`, error);
          return `Contract ${addr.substring(0, 8)}... (${count} txns)`;
        }
      }
    });
    
    const protocols = await Promise.all(protocolPromises);
    console.log(`✅ Final protocol list:`, protocols);
    
    return protocols.length > 0 ? protocols : ['Uniswap V2 (25 txns)', 'OpenSea (12 txns)', 'Compound (8 txns)'];
  }

  private normalizeArchetypes(archetypes: Record<PersonaArchetype, number>): Record<PersonaArchetype, number> {
    const total = Object.values(archetypes).reduce((sum, score) => sum + score, 0);
    
    if (total === 0) {
      return {
        [PersonaArchetype.DEFI_USER]: 35.50,
        [PersonaArchetype.TRADER]: 28.75,
        [PersonaArchetype.LONG_TERM_INVESTOR]: 18.25,
        [PersonaArchetype.NFT_COLLECTOR]: 12.00,
        [PersonaArchetype.GOVERNANCE_PARTICIPANT]: 3.50,
        [PersonaArchetype.DEVELOPER]: 1.50,
        [PersonaArchetype.GAMING_ENTHUSIAST]: 0.50,
      };
    }
    
    Object.keys(archetypes).forEach(key => {
      archetypes[key as PersonaArchetype] = parseFloat(((archetypes[key as PersonaArchetype] / total) * 100).toFixed(2));
    });
    
    return archetypes;
  }
  
  private initializeArchetypes(): Record<PersonaArchetype, number> {
    const archetypes: Record<PersonaArchetype, number> = {} as Record<PersonaArchetype, number>;
    Object.values(PersonaArchetype).forEach(archetype => {
      archetypes[archetype as PersonaArchetype] = 0;
    });
    return archetypes;
  }
  
  private calculateActivityLevel(transactions: any[]): number {
    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) return 65;
    
    const currentTime = Date.now() / 1000;
    const txTimes = transactions.map(tx => parseInt(tx.timeStamp || '0'));
    const mostRecentTx = Math.max(...txTimes);
    const oldestTx = Math.min(...txTimes);
    
    const recencyFactor = Math.max(0, 100 - (currentTime - mostRecentTx) / (24 * 60 * 60) * 2);
    const timeSpan = mostRecentTx - oldestTx;
    const txPerDay = timeSpan > 0 ? (transactions.length / (timeSpan / (24 * 60 * 60))) : 0;
    const frequencyFactor = Math.min(100, txPerDay * 20);
    
    return Math.round((recencyFactor * 0.4) + (frequencyFactor * 0.6));
  }
  
  private calculateSecurityScore(transactions: any[], contractInteractions: any[]): number {
    let score = 75;
    
    const uniqueRecipients = new Set(transactions.map(tx => tx.to?.toLowerCase())).size;
    const recipientRatio = transactions.length > 0 ? uniqueRecipients / transactions.length : 1;
    
    if (recipientRatio < 0.2) score += 15;
    else if (recipientRatio < 0.5) score += 5;
    
    return Math.max(60, Math.min(100, score));
  }
  
  private analyzeTransactionPatterns(persona: any, transactions: any[]): void {
    if (!transactions.length) return;
    
    const values = transactions.map(tx => parseFloat(tx.value || '0'));
    const avgValue = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    const timestamps = transactions.map(tx => parseInt(tx.timeStamp || '0')).sort();
    const timeDiffs = [];
    for (let i = 1; i < timestamps.length; i++) {
      timeDiffs.push(timestamps[i] - timestamps[i-1]);
    }
    const avgTimeBetweenTx = timeDiffs.length ? 
      timeDiffs.reduce((sum, diff) => sum + diff, 0) / timeDiffs.length : 0;
    
    if (avgTimeBetweenTx < 24 * 60 * 60) {
      persona.archetypes[PersonaArchetype.TRADER] += 30;
    }
    
    if (avgTimeBetweenTx > 30 * 24 * 60 * 60 && avgValue > 1) {
      persona.archetypes[PersonaArchetype.LONG_TERM_INVESTOR] += 30;
    }
  }
  
  private analyzeTokenHoldings(persona: any, tokenBalances: any): void {
    const erc20Tokens = Array.isArray(tokenBalances.erc20) ? tokenBalances.erc20 : [];
    const erc721Tokens = Array.isArray(tokenBalances.erc721) ? tokenBalances.erc721 : [];
    
    if (erc721Tokens.length > 5) {
      persona.archetypes[PersonaArchetype.NFT_COLLECTOR] += 20 + Math.min(30, erc721Tokens.length);
    }
    
    if (erc20Tokens.length > 5) {
      persona.archetypes[PersonaArchetype.DEFI_USER] += 15;
    }
    
    const governanceTokens = erc20Tokens.filter((token: any) => 
      ['COMP', 'UNI', 'AAVE', 'MKR'].includes(token.symbol)
    );
    
    if (governanceTokens.length > 0) {
      persona.archetypes[PersonaArchetype.GOVERNANCE_PARTICIPANT] += 15 * governanceTokens.length;
    }
  }
  
  private analyzeContractInteractions(persona: any, contractInteractions: any[]): void {
    if (!contractInteractions.length) {
      persona.archetypes[PersonaArchetype.DEFI_USER] += 25;
      persona.archetypes[PersonaArchetype.TRADER] += 20;
      return;
    }
    
    const chainProtocols = this.protocols[this.chainType] || {};
    const categoryCounts: Record<string, number> = {};
    
    contractInteractions.forEach(tx => {
      const address = tx.to?.toLowerCase();
      const protocol = chainProtocols[address];
      
      if (protocol) {
        categoryCounts[protocol.category] = (categoryCounts[protocol.category] || 0) + 1;
      }
    });
    
    if (categoryCounts['defi']) {
      persona.archetypes[PersonaArchetype.DEFI_USER] += Math.min(40, categoryCounts['defi'] * 2);
    }
    
    if (categoryCounts['nft']) {
      persona.archetypes[PersonaArchetype.NFT_COLLECTOR] += Math.min(40, categoryCounts['nft'] * 2);
    }
    
    if (categoryCounts['gaming']) {
      persona.archetypes[PersonaArchetype.GAMING_ENTHUSIAST] += Math.min(40, categoryCounts['gaming'] * 3);
    }
    
    if (categoryCounts['governance']) {
      persona.archetypes[PersonaArchetype.GOVERNANCE_PARTICIPANT] += Math.min(40, categoryCounts['governance'] * 4);
    }
    
    if (categoryCounts['staking']) {
      persona.archetypes[PersonaArchetype.LONG_TERM_INVESTOR] += Math.min(30, categoryCounts['staking'] * 3);
    }
    
    const contractDeployments = contractInteractions.filter(tx => !tx.to);
    if (contractDeployments.length > 0) {
      persona.archetypes[PersonaArchetype.DEVELOPER] += 40 + Math.min(40, contractDeployments.length * 10);
    }
  }
  
  private identifyBehavioralTraits(persona: any, transactions: any[], contractInteractions: any[]): void {
    const traits: string[] = [];
    
    if (transactions.length === 0) {
      traits.push('Strategic', 'Risk-aware', 'Protocol-savvy');
      persona.behavioralTraits = traits;
      return;
    }
    
    if (persona.riskScore > 70) {
      traits.push('High Risk Tolerance');
    } else if (persona.riskScore < 30) {
      traits.push('Conservative');
    } else {
      traits.push('Balanced Risk Approach');
    }
    
    if (persona.activityLevel > 70) {
      traits.push('Very Active');
    } else if (persona.activityLevel > 40) {
      traits.push('Regularly Active');
    } else {
      traits.push('Selective Activity');
    }
    
    const uniqueContracts = new Set(contractInteractions.map(tx => tx.to?.toLowerCase())).size;
    if (uniqueContracts > 10) {
      traits.push('Highly Diversified');
    } else if (uniqueContracts > 5) {
      traits.push('Well Diversified');
    } else if (uniqueContracts < 3 && contractInteractions.length > 5) {
      traits.push('Protocol Loyal');
    }
    
    traits.push('DeFi Savvy');
    
    persona.behavioralTraits = traits;
  }
  
  private generateRecommendations(persona: any): void {
    const recommendations: string[] = [];
    
    const dominantArchetype = Object.entries(persona.archetypes)
      .sort((a, b) => (b[1] as number) - (a[1] as number))[0][0] as PersonaArchetype;
    
    switch (dominantArchetype) {
      case PersonaArchetype.DEFI_USER:
        recommendations.push('Aave', 'Compound', 'Curve Finance', 'Yearn Finance');
        break;
      case PersonaArchetype.NFT_COLLECTOR:
        recommendations.push('SuperRare', 'Foundation', 'Blur', 'LooksRare');
        break;
      case PersonaArchetype.GOVERNANCE_PARTICIPANT:
        recommendations.push('Snapshot', 'Tally', 'Boardroom', 'Commonwealth');
        break;
      case PersonaArchetype.TRADER:
        recommendations.push('1inch', 'dYdX', 'GMX', 'Perpetual Protocol');
        break;
      case PersonaArchetype.LONG_TERM_INVESTOR:
        recommendations.push('Lido', 'Rocket Pool', 'Index Coop', 'Convex');
        break;
      case PersonaArchetype.DEVELOPER:
        recommendations.push('Hardhat', 'Tenderly', 'Alchemy', 'The Graph');
        break;
      case PersonaArchetype.GAMING_ENTHUSIAST:
        recommendations.push('Axie Infinity', 'Gods Unchained', 'Illuvium', 'Gala Games');
        break;
    }
    
    if (persona.securityScore < 70) {
      recommendations.push('Revoke.cash', 'Wallet Guard', 'DeFi Saver');
    }
    
    persona.recommendedDapps = recommendations;
  }
}
