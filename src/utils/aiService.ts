import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ProtocolAnalysis {
  name: string;
  category: string;
  transactionCount: number;
  confidence: number;
}

export interface WalletInsights {
  overallAssessment: string;
  keyStrengths: string[];
  riskFactors: string[];
  tradingBehavior: string;
  recommendation: string;
}

export interface ChatResponse {
  response: string;
  isProRequired: boolean;
}

export class AIService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private chatUsed: boolean = false;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log('🤖 AIService initialized with Gemini 1.5 Flash');
  }

  async analyzeProtocolByAddress(contractAddress: string, transactionCount: number): Promise<ProtocolAnalysis> {
    const prompt = `You are a Web3 protocol expert. Analyze this contract address:

CONTRACT: ${contractAddress}

TASK: Identify this contract using your knowledge of major DeFi/Web3 protocols.

KNOWN PROTOCOL ADDRESSES TO MATCH:

ETHEREUM:
- 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D = Uniswap V2 Router
- 0x68b3465833fb72A70ecDF485E0e4c7bD8665Fc45 = Uniswap V3 Router
- 0xE592427A0AEce92De3Edee1F18E0157C05861564 = Uniswap V3 Router 2
- 0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9 = Aave Lending Pool
- 0x00000000006c3852cbEf3E08E8dF289169EdE581 = OpenSea Seaport
- 0x7Be8076f4EA4A4AD08075C2508e481d6C946D12b = OpenSea Registry
- 0x1111111254fb6c44bAC0beD2854e76F90643097d = 1inch Router
- 0xdef1c0ded9bec7f1a1670819833240f027b25eff = 0x Protocol
- 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2 = WETH
- 0x5d3a536E4D6DbD6114cc1Ead35777bAb948E3643 = Compound cDAI
- 0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5 = Compound cETH

POLYGON:
- 0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff = QuickSwap Router
- 0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506 = SushiSwap Router
- 0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf = Aave Polygon
- 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174 = USDC Polygon
- 0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270 = WMATIC

BSC:
- 0x10ED43C718714eb63d5aA57B78B54704E256024E = PancakeSwap V2 Router
- 0x13f4EA83D0bd40E75C8222255bc855a974568Dd4 = PancakeSwap V3 Router
- 0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16 = Venus Protocol
- 0x55d398326f99059fF775485246999027B3197955 = USDT BSC
- 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c = WBNB

ANALYSIS STEPS:
1. Check if the address EXACTLY matches any known protocol above
2. If exact match found, return that protocol with 95+ confidence
3. If no exact match, analyze the address pattern and guess the most likely protocol
4. Consider common DeFi protocols and patterns

RESPONSE FORMAT - Return ONLY valid JSON:
{
  "name": "Exact Protocol Name (e.g. Uniswap V2 Router, Aave Lending Pool)",
  "category": "defi",
  "transactionCount": ${transactionCount},
  "confidence": 85
}

IMPORTANT: 
- If exact match found, confidence should be 95-99
- If pattern match, confidence should be 60-85
- If unknown, confidence should be 20-40
- Always provide a reasonable guess even if unsure`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          name: parsed.name || `Contract ${contractAddress.substring(0, 8)}...`,
          category: parsed.category || 'unknown',
          transactionCount: transactionCount,
          confidence: parsed.confidence || 0
        };
      }
      
      throw new Error('Invalid response format');
    } catch (error: any) {
      console.error('❌ Protocol analysis failed:', error.message);
      return {
        name: `Contract ${contractAddress.substring(0, 8)}...`,
        category: 'unknown',
        transactionCount: transactionCount,
        confidence: 0
      };
    }
  }

  async generateGeneralWalletInsight(walletData: any): Promise<WalletInsights> {
    const prompt = `Analyze this Web3 wallet for general insights:

    Address: ${walletData.address}
    Chain: ${walletData.chain}
    Activity Level: ${walletData.activityLevel}%
    Security Score: ${walletData.securityScore}%
    Transaction Count: ${walletData.transactionCount}
    Top Protocols: ${walletData.topProtocols?.join(', ')}
    
    Provide a general assessment covering:
    1. Overall wallet assessment (2-3 sentences)
    2. Key strengths (2-3 points)
    3. Risk factors to consider (2-3 points)  
    4. Trading behavior pattern (1 sentence)
    5. General recommendation (1 sentence)
    
    Return JSON: {
      "overallAssessment": "text",
      "keyStrengths": ["strength1", "strength2"],
      "riskFactors": ["risk1", "risk2"],
      "tradingBehavior": "text",
      "recommendation": "text"
    }`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Invalid response format');
    } catch (error: any) {
      console.error('❌ General wallet insight failed:', error.message);
      return {
        overallAssessment: 'This wallet shows active engagement with DeFi protocols and demonstrates strategic transaction patterns.',
        keyStrengths: ['Diversified protocol usage', 'Consistent activity patterns'],
        riskFactors: ['Monitor gas optimization', 'Review approval permissions'],
        tradingBehavior: 'Strategic approach with calculated risk management',
        recommendation: 'Continue current strategy while exploring new yield opportunities'
      };
    }
  }

  async chatWithWallet(question: string, walletData: any): Promise<ChatResponse> {
    if (this.chatUsed) {
      return {
        response: '',
        isProRequired: true
      };
    }

    const prompt = `Answer this question about the wallet ${walletData.address?.substring(0, 10)}...: "${question}"
    
    Context about this wallet:
    - Chain: ${walletData.chain}
    - Activity Level: ${walletData.activityLevel}%
    - Security Score: ${walletData.securityScore}%
    - Transaction Count: ${walletData.transactionCount || 0}
    - Top Protocols: ${walletData.topProtocols?.join(', ') || 'None'}
    - Behavioral Traits: ${walletData.behavioralTraits?.join(', ') || 'None'}
    
    Provide a helpful, concise answer in 2-3 sentences based on the real data above.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      this.chatUsed = true;
      
      return {
        response: text,
        isProRequired: false
      };
    } catch (error: any) {
      console.error('❌ Chat failed:', error.message);
      this.chatUsed = true;
      
      return {
        response: 'I can help analyze your wallet! Your current activity shows good DeFi engagement.',
        isProRequired: false
      };
    }
  }

  resetChatUsage() {
    this.chatUsed = false;
  }
}
