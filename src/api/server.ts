import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { MultiChainDataCollector } from '../utils/multiChainDataCollector';
import { EnhancedPersonaEngine } from '../models/enhancedPersonaEngine';
import { Request, Response } from 'express';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

const apiKeys = {
  etherscan: process.env.ETHERSCAN_API_KEY || '',
  polygonscan: process.env.POLYGONSCAN_API_KEY || '',
  bscscan: process.env.BSCSCAN_API_KEY || '',
};

const geminiApiKey = process.env.GEMINI_API_KEY || '';

const ethereumCollector = new MultiChainDataCollector(
  'ethereum',
  process.env.ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/your-infura-key',
  {
    etherscan: apiKeys.etherscan,
  }
);

const polygonCollector = new MultiChainDataCollector(
  'polygon',
  process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
  {
    polygonscan: apiKeys.polygonscan,
  }
);

const bscCollector = new MultiChainDataCollector(
  'bsc',
  process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org/',
  {
    bscscan: apiKeys.bscscan,
  }
);

const ethereumPersonaEngine = new EnhancedPersonaEngine(ethereumCollector, geminiApiKey);
const polygonPersonaEngine = new EnhancedPersonaEngine(polygonCollector, geminiApiKey);
const bscPersonaEngine = new EnhancedPersonaEngine(bscCollector, geminiApiKey);

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', ai: !!geminiApiKey });
});

app.get('/api/persona/:chain/:address', async (req: Request, res: Response) => {
  try {
    const { address, chain } = req.params;
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: 'Invalid Ethereum address format' });
    }
    
    let persona;
    
    if (chain === 'polygon') {
      persona = await polygonPersonaEngine.generateEnhancedPersona(address);
    } else if (chain === 'bsc') {
      persona = await bscPersonaEngine.generateEnhancedPersona(address);
    } else {
      persona = await ethereumPersonaEngine.generateEnhancedPersona(address);
    }
    
    res.json(persona);
  } catch (error) {
    console.error('Error generating persona:', error);
    res.status(500).json({ error: 'Failed to generate persona' });
  }
});

app.get('/api/persona/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: 'Invalid Ethereum address format' });
    }
    
    const persona = await ethereumPersonaEngine.generateEnhancedPersona(address);
    res.json(persona);
  } catch (error) {
    console.error('Error generating persona:', error);
    res.status(500).json({ error: 'Failed to generate persona' });
  }
});

app.post('/api/chat/:chain/:address', async (req: Request, res: Response) => {
  try {
    const { address, chain } = req.params;
    const { question, history = [] } = req.body;
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: 'Invalid Ethereum address format' });
    }
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }
    
    let engine;
    if (chain === 'polygon') {
      engine = polygonPersonaEngine;
    } else if (chain === 'bsc') {
      engine = bscPersonaEngine;
    } else {
      engine = ethereumPersonaEngine;
    }
    
    // Get basic wallet data for context
    const walletData = {
      address,
      chain,
      // Add any cached data you have
    };
    
    const response = await engine.chatWithWallet(question, walletData, history);
    res.json(response);
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
});

app.listen(PORT, () => {
  console.log(`ChainPersona AI server running on port ${PORT}`);
  console.log(`AI Features: ${geminiApiKey ? 'Enabled' : 'Disabled (add GEMINI_API_KEY)'}`);
});
