import { GoogleGenerativeAI } from '@google/generative-ai';

export interface DetailedAnalysis {
  riskAssessment: {
    overall: string;
    factors: string[];
    score: number;
  };
  tradingPatterns: {
    style: string;
    frequency: string;
    preferences: string[];
  };
  protocolExpertise: {
    level: string;
    specializations: string[];
    recommendations: string[];
  };
  securityAnalysis: {
    strengths: string[];
    vulnerabilities: string[];
    recommendations: string[];
  };
  portfolioInsights: {
    diversification: string;
    allocation: string;
    suggestions: string[];
  };
}

export class DetailedAnalysisService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log('🔍 Detailed Analysis Service initialized with Enhanced Gemini API');
  }

  async generateDetailedAnalysis(walletData: any): Promise<DetailedAnalysis> {
    const prompt = `Perform a comprehensive Web3 wallet analysis for advanced insights:

WALLET DATA:
- Address: ${walletData.address}
- Chain: ${walletData.chain}
- Activity Level: ${walletData.activityLevel}%
- Security Score: ${walletData.securityScore}%
- Transaction Count: ${walletData.transactionCount}
- Token Count: ${walletData.tokenCount}
- NFT Count: ${walletData.nftCount}
- Top Protocols: ${walletData.topProtocols?.join(', ')}
- Behavioral Traits: ${walletData.behavioralTraits?.join(', ')}
- Archetypes: ${JSON.stringify(walletData.archetypes)}

ANALYSIS REQUIREMENTS:
Provide detailed insights across 5 key areas:

1. RISK ASSESSMENT
   - Overall risk profile assessment
   - Key risk factors identified
   - Risk score justification (0-100)

2. TRADING PATTERNS
   - Trading style classification
   - Transaction frequency analysis
   - Protocol preferences and patterns

3. PROTOCOL EXPERTISE
   - DeFi sophistication level
   - Areas of specialization
   - Protocol recommendations

4. SECURITY ANALYSIS
   - Security strengths
   - Potential vulnerabilities
   - Security improvement recommendations

5. PORTFOLIO INSIGHTS
   - Diversification analysis
   - Asset allocation assessment
   - Portfolio optimization suggestions

Return comprehensive JSON:
{
  "riskAssessment": {
    "overall": "detailed risk profile description",
    "factors": ["factor1", "factor2", "factor3"],
    "score": 75
  },
  "tradingPatterns": {
    "style": "trading style description",
    "frequency": "frequency analysis",
    "preferences": ["preference1", "preference2"]
  },
  "protocolExpertise": {
    "level": "expertise level",
    "specializations": ["area1", "area2"],
    "recommendations": ["rec1", "rec2"]
  },
  "securityAnalysis": {
    "strengths": ["strength1", "strength2"],
    "vulnerabilities": ["vuln1", "vuln2"],
    "recommendations": ["rec1", "rec2"]
  },
  "portfolioInsights": {
    "diversification": "diversification analysis",
    "allocation": "allocation assessment",
    "suggestions": ["suggestion1", "suggestion2"]
  }
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
      console.error('❌ Detailed analysis failed:', error.message);
      return this.getDefaultAnalysis();
    }
  }

  private getDefaultAnalysis(): DetailedAnalysis {
    return {
      riskAssessment: {
        overall: "Moderate risk profile with balanced approach to DeFi participation",
        factors: ["Protocol diversification", "Transaction frequency", "Security practices"],
        score: 65
      },
      tradingPatterns: {
        style: "Strategic DeFi participant with calculated approach",
        frequency: "Regular but measured transaction activity",
        preferences: ["Established protocols", "Yield farming", "Liquidity provision"]
      },
      protocolExpertise: {
        level: "Intermediate to Advanced",
        specializations: ["DeFi protocols", "Yield optimization"],
        recommendations: ["Explore advanced strategies", "Consider governance participation"]
      },
      securityAnalysis: {
        strengths: ["Diversified protocol usage", "Regular activity monitoring"],
        vulnerabilities: ["Approval management", "Smart contract risks"],
        recommendations: ["Regular security audits", "Use hardware wallet"]
      },
      portfolioInsights: {
        diversification: "Well-diversified across multiple protocols and strategies",
        allocation: "Balanced allocation between different DeFi sectors",
        suggestions: ["Consider rebalancing", "Explore new yield opportunities"]
      }
    };
  }
}
