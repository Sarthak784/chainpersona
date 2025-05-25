import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { DataCollector } from '../utils/dataCollector';
import { EnhancedPersonaEngine } from '../models/enhancedPersonaEngine';
import { DetailedAnalysisService } from '../utils/detailedAnalysisService';

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

// Initialize persona engines with first Gemini API
const personaEngines = {
  ethereum: new EnhancedPersonaEngine(dataCollectors.ethereum, process.env.GEMINI_API_KEY!),
  polygon: new EnhancedPersonaEngine(dataCollectors.polygon, process.env.GEMINI_API_KEY!),
  bsc: new EnhancedPersonaEngine(dataCollectors.bsc, process.env.GEMINI_API_KEY!)
};

// Initialize detailed analysis service with second Gemini API
let detailedAnalysisService: DetailedAnalysisService | null = null;
if (process.env.GEMINI_ENHANCED_API_KEY) {
  detailedAnalysisService = new DetailedAnalysisService(process.env.GEMINI_ENHANCED_API_KEY);
  console.log('🔍 Detailed Analysis Service initialized');
} else {
  console.log('⚠️ Detailed Analysis Service disabled - GEMINI_ENHANCED_API_KEY not found');
}

console.log('🚀 Initialized data collectors for:', Object.keys(dataCollectors).join(', '));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    chains: Object.keys(dataCollectors),
    ai: !!process.env.GEMINI_API_KEY,
    detailedAnalysis: !!detailedAnalysisService,
    features: {
      protocolIdentification: true,
      smartChatbot: true,
      detailedAnalysis: !!detailedAnalysisService,
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

// Detailed analysis endpoint - Uses second Gemini API
app.post('/api/detailed-analysis', async (req, res) => {
  try {
    const { walletData } = req.body;
    
    if (!detailedAnalysisService) {
      return res.status(400).json({ 
        error: 'Detailed analysis not available',
        message: 'GEMINI_ENHANCED_API_KEY not configured'
      });
    }
    
    console.log(`🔍 Generating detailed analysis for ${walletData.address}`);
    
    const detailedAnalysis = await detailedAnalysisService.generateDetailedAnalysis(walletData);
    
    console.log(`✅ Detailed analysis complete`);
    res.json(detailedAnalysis);
  } catch (error: any) {
    console.error('❌ Detailed analysis error:', error);
    res.status(500).json({ 
      error: 'Detailed analysis failed', 
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

// Serve the main app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`🌟 ChainPersona AI server running on port ${PORT}`);
  console.log(`🔗 Supported chains: ${Object.keys(dataCollectors).join(', ')}`);
  console.log(`🤖 First Gemini API (Protocols + Chat): ${process.env.GEMINI_API_KEY ? 'Enabled' : 'Disabled'}`);
  console.log(`🔍 Second Gemini API (Detailed Analysis): ${detailedAnalysisService ? 'Enabled' : 'Disabled'}`);
  console.log(`📊 Transaction History: Enabled (No API calls for protocol names)`);
});
