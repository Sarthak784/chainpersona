import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { MultiChainDataCollector } from '../utils/multiChainDataCollector';
import { PersonaEngine } from '../models/personaEngine';
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

const ethereumCollector = new MultiChainDataCollector(
  'ethereum',
  process.env.ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/your-infura-key',
  {
    etherscan: process.env.ETHERSCAN_API_KEY || '',
  }
);

const polygonCollector = new MultiChainDataCollector(
  'polygon',
  process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
  {
    polygonscan: process.env.POLYGONSCAN_API_KEY || '',
  }
);

const bscCollector = new MultiChainDataCollector(
  'bsc',
  process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org/',
  {
    bscscan: process.env.BSCSCAN_API_KEY || '',
  }
);

const ethereumPersonaEngine = new PersonaEngine(ethereumCollector);
const polygonPersonaEngine = new PersonaEngine(polygonCollector);
const bscPersonaEngine = new PersonaEngine(bscCollector);

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy' });
});

app.get('/api/persona/:chain/:address', async (req: Request, res: Response) => {
  try {
    const { address, chain } = req.params;
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: 'Invalid Ethereum address format' });
    }
    
    let persona;
    
    if (chain === 'polygon') {
      persona = await polygonPersonaEngine.generatePersona(address);
    } else if (chain === 'bsc') {
      persona = await bscPersonaEngine.generatePersona(address);
    } else {
      persona = await ethereumPersonaEngine.generatePersona(address);
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
    
    const persona = await ethereumPersonaEngine.generatePersona(address);
    res.json(persona);
  } catch (error) {
    console.error('Error generating persona:', error);
    res.status(500).json({ error: 'Failed to generate persona' });
  }
});

app.listen(PORT, () => {
  console.log(`ChainPersona API server running on port ${PORT}`);
});
