import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ProtocolAnalysis {
  name: string;
  category: string;
  description: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  confidence: number;
}

export interface WalletInsights {
  tradingStyle: string;
  riskTolerance: string;
  defiSophistication: string;
  behavioralTraits: string[];
  recommendations: string[];
  securityAssessment: string;
  marketContext: string;
}

export interface ChatResponse {
  response: string;
  suggestions: string[];
  actionItems?: string[];
}

export class AIService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  async analyzeProtocol(contractAddress: string, contractName?: string, transactionData?: any): Promise<ProtocolAnalysis> {
    const prompt = `
You are a blockchain protocol expert. Analyze this smart contract:

Contract Address: ${contractAddress}
Contract Name: ${contractName || 'Unknown'}
Transaction Patterns: ${transactionData ? JSON.stringify(transactionData) : 'Limited data'}

Based on the address pattern, name, and transaction data, provide a detailed analysis:

1. Identify the most likely protocol name
2. Categorize it (DeFi, NFT, Gaming, Governance, Staking, Bridge, etc.)
3. Provide a brief description of its function
4. Assess risk level based on known patterns
5. Rate your confidence (0-100)

Consider these factors:
- Known protocol addresses and patterns
- Contract naming conventions
- Transaction volume and frequency
- Common DeFi/NFT/Gaming patterns

Respond in valid JSON format:
{
  "name": "Protocol Name",
  "category": "Category",
  "description": "Brief functional description",
  "riskLevel": "Low|Medium|High",
  "confidence": 85
}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('AI Protocol Analysis failed:', error);
      return {
        name: contractName || `Contract ${contractAddress.substring(0, 8)}...`,
        category: 'unknown',
        description: 'Unable to analyze this contract',
        riskLevel: 'Medium',
        confidence: 0
      };
    }
  }

  async generateWalletInsights(walletData: any): Promise<WalletInsights> {
    const prompt = `
You are a DeFi expert analyzing wallet behavior. Analyze this wallet comprehensively:

Wallet Address: ${walletData.address}
Chain: ${walletData.chain}
Transaction Count: ${walletData.transactionCount}
Activity Level: ${walletData.activityLevel}%
Security Score: ${walletData.securityScore}%
Top Protocols: ${walletData.topProtocols?.join(', ')}
Token Holdings: ${walletData.tokenCount} tokens
NFT Holdings: ${walletData.nftCount} NFTs
Average Transaction Value: ${walletData.avgTxValue}
Time Span: ${walletData.timeSpan} days
Recent Activity: ${walletData.recentActivity}

Provide a comprehensive personality analysis:

1. Trading Style: (Conservative, Moderate, Aggressive, Algorithmic, etc.)
2. Risk Tolerance: (Risk-averse, Balanced, Risk-seeking, Degen)
3. DeFi Sophistication: (Beginner, Intermediate, Advanced, Expert)
4. Behavioral Traits: List 3-5 key characteristics
5. Personalized Recommendations: 5 specific actionable suggestions
6. Security Assessment: Detailed security posture analysis
7. Market Context: How this wallet fits in current market trends

Consider:
- Transaction patterns and frequency
- Protocol diversity and usage
- Value movements and holding periods
- Security practices and risk exposure
- Market timing and trend following

Respond in valid JSON format:
{
  "tradingStyle": "Style description",
  "riskTolerance": "Risk level with explanation",
  "defiSophistication": "Skill level with reasoning",
  "behavioralTraits": ["trait1", "trait2", "trait3"],
  "recommendations": ["rec1", "rec2", "rec3", "rec4", "rec5"],
  "securityAssessment": "Detailed security analysis",
  "marketContext": "Market positioning analysis"
}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('AI Wallet Analysis failed:', error);
      return {
        tradingStyle: 'Analysis unavailable',
        riskTolerance: 'Unable to determine',
        defiSophistication: 'Assessment pending',
        behavioralTraits: ['Data insufficient'],
        recommendations: ['Enable detailed analysis with more transaction data'],
        securityAssessment: 'Security analysis unavailable',
        marketContext: 'Market context analysis pending'
      };
    }
  }

  async chatWithWallet(question: string, walletData: any, conversationHistory: string[] = []): Promise<ChatResponse> {
    const prompt = `
You are an AI assistant specializing in blockchain and DeFi analysis. The user is asking about their wallet:

Wallet Data: ${JSON.stringify(walletData, null, 2)}
Conversation History: ${conversationHistory.join('\n')}

User Question: "${question}"

Provide a helpful, accurate, and personalized response. Include:
1. Direct answer to their question
2. 2-3 follow-up suggestions
3. Optional action items if relevant

Be conversational, educational, and specific to their wallet data.

Respond in valid JSON format:
{
  "response": "Detailed answer to their question",
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "actionItems": ["action1", "action2"] // optional
}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('AI Chat failed:', error);
      return {
        response: 'I apologize, but I cannot process your question right now. Please try again.',
        suggestions: ['Try asking about your top protocols', 'Ask about risk assessment', 'Inquire about recommendations']
      };
    }
  }

  async generatePortfolioOptimization(walletData: any, marketData?: any): Promise<any> {
    const prompt = `
You are a DeFi portfolio optimization expert. Analyze this wallet and provide optimization suggestions:

Current Portfolio: ${JSON.stringify(walletData, null, 2)}
Market Data: ${marketData ? JSON.stringify(marketData) : 'Limited market data'}

Provide comprehensive portfolio optimization:

1. Asset Allocation Analysis
2. Risk Diversification Suggestions
3. Yield Optimization Opportunities
4. Rebalancing Recommendations
5. Protocol Migration Suggestions
6. Security Improvements
7. Gas Optimization Tips
8. Timeline for Implementation

Consider:
- Current market conditions
- Risk-adjusted returns
- Protocol security scores
- Gas efficiency
- Liquidity considerations
- Impermanent loss risks

Respond in valid JSON format with actionable recommendations.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return { error: 'Unable to generate optimization suggestions' };
    } catch (error) {
      console.error('Portfolio optimization failed:', error);
      return { error: 'Portfolio optimization temporarily unavailable' };
    }
  }

  async detectSecurityThreats(walletData: any, recentTransactions: any[]): Promise<any> {
    const prompt = `
You are a blockchain security expert. Analyze this wallet for potential security threats:

Wallet Data: ${JSON.stringify(walletData, null, 2)}
Recent Transactions: ${JSON.stringify(recentTransactions.slice(0, 20), null, 2)}

Analyze for:
1. Suspicious transaction patterns
2. Risky protocol interactions
3. Unusual approval patterns
4. Potential phishing attempts
5. Compromised security indicators
6. Recommended security improvements

Provide a comprehensive security assessment with specific actionable recommendations.

Respond in valid JSON format:
{
  "threatLevel": "Low|Medium|High|Critical",
  "threats": ["threat1", "threat2"],
  "recommendations": ["rec1", "rec2"],
  "urgentActions": ["action1", "action2"],
  "securityScore": 85
}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return { threatLevel: 'Unknown', threats: [], recommendations: [], urgentActions: [], securityScore: 50 };
    } catch (error) {
      console.error('Security analysis failed:', error);
      return { threatLevel: 'Unknown', threats: [], recommendations: [], urgentActions: [], securityScore: 50 };
    }
  }
}
