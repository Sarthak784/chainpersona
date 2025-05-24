"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const multiChainDataCollector_1 = require("../utils/multiChainDataCollector");
const enhancedPersonaEngine_1 = require("../models/enhancedPersonaEngine");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static('public'));
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../../public/index.html'));
});
const apiKeys = {
    etherscan: process.env.ETHERSCAN_API_KEY || '',
    polygonscan: process.env.POLYGONSCAN_API_KEY || '',
    bscscan: process.env.BSCSCAN_API_KEY || '',
};
const geminiApiKey = process.env.GEMINI_API_KEY || '';
const ethereumCollector = new multiChainDataCollector_1.MultiChainDataCollector('ethereum', process.env.ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/your-infura-key', {
    etherscan: apiKeys.etherscan,
});
const polygonCollector = new multiChainDataCollector_1.MultiChainDataCollector('polygon', process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com', {
    polygonscan: apiKeys.polygonscan,
});
const bscCollector = new multiChainDataCollector_1.MultiChainDataCollector('bsc', process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org/', {
    bscscan: apiKeys.bscscan,
});
const ethereumPersonaEngine = new enhancedPersonaEngine_1.EnhancedPersonaEngine(ethereumCollector, geminiApiKey);
const polygonPersonaEngine = new enhancedPersonaEngine_1.EnhancedPersonaEngine(polygonCollector, geminiApiKey);
const bscPersonaEngine = new enhancedPersonaEngine_1.EnhancedPersonaEngine(bscCollector, geminiApiKey);
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', ai: !!geminiApiKey });
});
app.get('/api/persona/:chain/:address', async (req, res) => {
    try {
        const { address, chain } = req.params;
        if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
            return res.status(400).json({ error: 'Invalid Ethereum address format' });
        }
        let persona;
        if (chain === 'polygon') {
            persona = await polygonPersonaEngine.generateEnhancedPersona(address);
        }
        else if (chain === 'bsc') {
            persona = await bscPersonaEngine.generateEnhancedPersona(address);
        }
        else {
            persona = await ethereumPersonaEngine.generateEnhancedPersona(address);
        }
        res.json(persona);
    }
    catch (error) {
        console.error('Error generating persona:', error);
        res.status(500).json({ error: 'Failed to generate persona' });
    }
});
app.get('/api/persona/:address', async (req, res) => {
    try {
        const { address } = req.params;
        if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
            return res.status(400).json({ error: 'Invalid Ethereum address format' });
        }
        const persona = await ethereumPersonaEngine.generateEnhancedPersona(address);
        res.json(persona);
    }
    catch (error) {
        console.error('Error generating persona:', error);
        res.status(500).json({ error: 'Failed to generate persona' });
    }
});
app.post('/api/chat/:chain/:address', async (req, res) => {
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
        }
        else if (chain === 'bsc') {
            engine = bscPersonaEngine;
        }
        else {
            engine = ethereumPersonaEngine;
        }
        const walletData = {
            address,
            chain,
        };
        const response = await engine.chatWithWallet(question, walletData, history);
        res.json(response);
    }
    catch (error) {
        console.error('Error in chat:', error);
        res.status(500).json({ error: 'Failed to process chat request' });
    }
});
app.listen(PORT, () => {
    console.log(`ChainPersona AI server running on port ${PORT}`);
    console.log(`AI Features: ${geminiApiKey ? 'Enabled' : 'Disabled (add GEMINI_API_KEY)'}`);
});
//# sourceMappingURL=server.js.map