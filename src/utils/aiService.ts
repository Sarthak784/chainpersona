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

  // ENHANCED PROMPT ENGINEERING - Clean protocol names only
  async analyzeProtocolByAddress(contractAddress: string, transactionCount: number): Promise<ProtocolAnalysis> {
    const prompt = `You are a Web3 protocol expert. Identify this contract address and return ONLY the clean protocol name.

CONTRACT: ${contractAddress}

RULES:
1. Return ONLY the protocol name (e.g., "Uniswap V3", "Aave", "OpenSea")
2. NO "Router", "Contract", "Protocol" suffixes unless it's part of the actual name
3. Use the most common/recognizable name
4. If unknown, return "Unknown Protocol"

KNOWN PROTOCOLS:
- Uniswap (V2/V3)
- Aave 
- Compound
- OpenSea
- SushiSwap
- Curve Finance
- 1inch
- MakerDAO
- Lido
- PancakeSwap
- QuickSwap
- Balancer
- Yearn Finance

Return ONLY JSON:
{
  "name": "Clean Protocol Name",
  "category": "defi",
  "transactionCount": ${transactionCount},
  "confidence": 90
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          name: parsed.name || 'Unknown Protocol',
          category: parsed.category || 'unknown',
          transactionCount: transactionCount,
          confidence: parsed.confidence || 0
        };
      }
      
      throw new Error('Invalid response format');
    } catch (error: any) {
      console.error('❌ Protocol analysis failed:', error.message);
      return {
        name: 'Unknown Protocol',
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
