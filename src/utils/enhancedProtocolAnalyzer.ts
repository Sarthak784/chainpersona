import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ProtocolInfo {
  name: string;
  category: string;
  description: string;
  confidence: number;
}

export class EnhancedProtocolAnalyzer {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log('🔍 Enhanced Protocol Analyzer initialized');
  }

  async analyzeContractAddress(contractAddress: string, chainType: string): Promise<ProtocolInfo> {
    const prompt = `You are a Web3 protocol expert. Analyze this contract address on ${chainType.toUpperCase()}:

CONTRACT: ${contractAddress}
BLOCKCHAIN: ${chainType.toUpperCase()}

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
4. Consider the blockchain context (different protocols on different chains)

RESPONSE FORMAT - Return ONLY valid JSON:
{
  "name": "Exact Protocol Name (e.g. Uniswap V2 Router, Aave Lending Pool)",
  "category": "defi|nft|gaming|staking|bridge|governance|exchange|lending",
  "description": "Brief description of what this contract does",
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
      
      console.log(`🔍 AI Response for ${contractAddress.substring(0, 10)}:`, text.substring(0, 200));
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const protocolInfo = {
          name: parsed.name || `Contract ${contractAddress.substring(0, 8)}...`,
          category: parsed.category || 'unknown',
          description: parsed.description || 'Unknown contract',
          confidence: parsed.confidence || 0
        };
        
        console.log(`✅ Identified: ${protocolInfo.name} (${protocolInfo.confidence}% confidence)`);
        return protocolInfo;
      }
      
      throw new Error('Invalid JSON response format');
    } catch (error: any) {
      console.error('❌ Enhanced protocol analysis failed:', error.message);
      return {
        name: `Contract ${contractAddress.substring(0, 8)}...`,
        category: 'unknown',
        description: 'Analysis failed',
        confidence: 0
      };
    }
  }

  async batchAnalyzeContracts(contracts: string[], chainType: string): Promise<Map<string, ProtocolInfo>> {
    const results = new Map<string, ProtocolInfo>();
    
    console.log(`🔍 Starting batch analysis of ${contracts.length} contracts on ${chainType}`);
    
    // Process in smaller batches to avoid rate limits
    for (let i = 0; i < contracts.length; i++) {
      const contract = contracts[i];
      try {
        console.log(`🔍 Analyzing contract ${i + 1}/${contracts.length}: ${contract.substring(0, 10)}...`);
        const info = await this.analyzeContractAddress(contract, chainType);
        results.set(contract.toLowerCase(), info);
        
        // Longer delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Failed to analyze contract ${contract}:`, error);
        // Add fallback result
        results.set(contract.toLowerCase(), {
          name: `Contract ${contract.substring(0, 8)}...`,
          category: 'unknown',
          description: 'Analysis failed',
          confidence: 0
        });
      }
    }
    
    console.log(`✅ Batch analysis complete: ${results.size} contracts analyzed`);
    return results;
  }
}
