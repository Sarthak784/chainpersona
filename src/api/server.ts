import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { DataCollector } from '../utils/dataCollector';
import { EnhancedPersonaEngine } from '../models/enhancedPersonaEngine';
import { EnhancedProtocolAnalyzer } from '../utils/enhancedProtocolAnalyzer';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../public')));

// Validate environment variables
if (!process.env.ETHERSCAN_API_KEY) {
  console.error('❌ ETHERSCAN_API_KEY is required');
  process.exit(1);
}

if (!process.env.POLYGONSCAN_API_KEY) {
  console.error('❌ POLYGONSCAN_API_KEY is required');
  process.exit(1);
}

if (!process.env.BSCSCAN_API_KEY) {
  console.error('❌ BSCSCAN_API_KEY is required');
  process.exit(1);
}

if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY is required');
  process.exit(1);
}

console.log('🔑 Environment variables loaded successfully');

// Initialize data collectors for different chains
const dataCollectors = {
  ethereum: new DataCollector(process.env.ETHERSCAN_API_KEY!, 'ethereum'),
  polygon: new DataCollector(process.env.POLYGONSCAN_API_KEY!, 'polygon'),
  bsc: new DataCollector(process.env.BSCSCAN_API_KEY!, 'bsc')
};

// Initialize persona engines
const personaEngines = {
  ethereum: new EnhancedPersonaEngine(dataCollectors.ethereum, process.env.GEMINI_API_KEY!),
  polygon: new EnhancedPersonaEngine(dataCollectors.polygon, process.env.GEMINI_API_KEY!),
  bsc: new EnhancedPersonaEngine(dataCollectors.bsc, process.env.GEMINI_API_KEY!)
};

// Initialize enhanced protocol analyzer if enhanced API key is available
let protocolAnalyzer: EnhancedProtocolAnalyzer | null = null;
if (process.env.GEMINI_ENHANCED_API_KEY) {
  protocolAnalyzer = new EnhancedProtocolAnalyzer(process.env.GEMINI_ENHANCED_API_KEY);
  console.log('🔍 Enhanced Protocol Analyzer initialized');
} else {
  console.log('⚠️ Enhanced Protocol Analyzer disabled - GEMINI_ENHANCED_API_KEY not found');
}

console.log('🚀 Initialized data collectors for:', Object.keys(dataCollectors).join(', '));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    chains: Object.keys(dataCollectors),
    ai: !!process.env.GEMINI_API_KEY,
    enhancedProtocolAnalysis: !!protocolAnalyzer,
    features: {
      transactionHistory: true,
      protocolIdentification: !!protocolAnalyzer,
      smartChatbot: true,
      multiChain: true
    }
  });
});

// Persona analysis endpoint
app.get('/api/persona/:chain/:address', async (req, res) => {
  try {
    const { chain, address } = req.params;
    
    // Validate chain
    if (!personaEngines[chain as keyof typeof personaEngines]) {
      return res.status(400).json({ 
        error: 'Unsupported chain',
        supportedChains: Object.keys(personaEngines)
      });
    }
    
    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    console.log(`🔍 Analyzing ${chain} wallet: ${address}`);
    
    const engine = personaEngines[chain as keyof typeof personaEngines];
    const persona = await engine.generateEnhancedPersona(address);
    
    console.log(`✅ Analysis complete for ${address}`);
    res.json(persona);
  } catch (error: any) {
    console.error('❌ Persona analysis error:', error);
    res.status(500).json({ 
      error: 'Analysis failed', 
      message: error.message,
      chain: req.params.chain
    });
  }
});

// Enhanced protocol analysis endpoint
app.post('/api/analyze-protocols', async (req, res) => {
  try {
    const { contracts, chain } = req.body;
    
    if (!protocolAnalyzer) {
      return res.status(400).json({ 
        error: 'Enhanced protocol analysis not available',
        message: 'GEMINI_ENHANCED_API_KEY not configured'
      });
    }
    
    if (!Array.isArray(contracts) || contracts.length === 0) {
      return res.status(400).json({ error: 'Invalid contracts array' });
    }
    
    console.log(`🔍 Analyzing ${contracts.length} protocols on ${chain}`);
    
    const results = await protocolAnalyzer.batchAnalyzeContracts(contracts, chain);
    
    // Convert Map to Object for JSON response
    const protocolData = Object.fromEntries(results);
    
    console.log(`✅ Protocol analysis complete for ${contracts.length} contracts`);
    res.json(protocolData);
  } catch (error: any) {
    console.error('❌ Protocol analysis error:', error);
    res.status(500).json({ 
      error: 'Protocol analysis failed', 
      message: error.message 
    });
  }
});

// Chat endpoint
app.post('/api/chat/:chain/:address', async (req, res) => {
  try {
    const { chain, address } = req.params;
    const { question, history, walletData } = req.body;
    
    if (!personaEngines[chain as keyof typeof personaEngines]) {
      return res.status(400).json({ error: 'Unsupported chain' });
    }
    
    console.log(`💬 Chat request for ${chain}:${address}`);
    
    const engine = personaEngines[chain as keyof typeof personaEngines];
    const response = await engine.chatWithWallet(question, walletData, history);
    
    res.json(response);
  } catch (error: any) {
    console.error('❌ Chat error:', error);
    res.status(500).json({ 
      error: 'Chat failed', 
      message: error.message 
    });
  }
});

// Test endpoint for debugging
app.get('/api/test/:chain/:address', async (req, res) => {
  try {
    const { chain, address } = req.params;
    
    if (!dataCollectors[chain as keyof typeof dataCollectors]) {
      return res.status(400).json({ error: 'Unsupported chain' });
    }
    
    const collector = dataCollectors[chain as keyof typeof dataCollectors];
    
    const [transactions, tokens] = await Promise.all([
      collector.getWalletTransactions(address, 5),
      collector.getTokenBalances(address)
    ]);
    
    res.json({
      chain,
      address,
      transactionCount: transactions.length,
      tokenCount: tokens.erc20.length,
      sampleTransaction: transactions[0] || null,
      status: 'success'
    });
  } catch (error: any) {
    console.error('❌ Test error:', error);
    res.status(500).json({ 
      error: 'Test failed', 
      message: error.message 
    });
  }
});

// Serve the main app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`🌟 ChainPersona AI server running on port ${PORT}`);
  console.log(`🔗 Supported chains: ${Object.keys(dataCollectors).join(', ')}`);
  console.log(`🤖 AI features: ${process.env.GEMINI_API_KEY ? 'Enabled' : 'Disabled'}`);
  console.log(`🔍 Enhanced Protocol Analysis: ${protocolAnalyzer ? 'Enabled' : 'Disabled'}`);
  console.log(`📊 Transaction History: Enabled`);
  console.log(`💬 Smart Chatbot: Enabled`);
});
