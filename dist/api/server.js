"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const dataCollector_1 = require("../utils/dataCollector");
const enhancedPersonaEngine_1 = require("../models/enhancedPersonaEngine");
const detailedAnalysisService_1 = require("../utils/detailedAnalysisService");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, '../../public')));
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
const dataCollectors = {
    ethereum: new dataCollector_1.DataCollector(process.env.ETHERSCAN_API_KEY, 'ethereum'),
    polygon: new dataCollector_1.DataCollector(process.env.POLYGONSCAN_API_KEY, 'polygon'),
    bsc: new dataCollector_1.DataCollector(process.env.BSCSCAN_API_KEY, 'bsc')
};
const personaEngines = {
    ethereum: new enhancedPersonaEngine_1.EnhancedPersonaEngine(dataCollectors.ethereum, process.env.GEMINI_API_KEY),
    polygon: new enhancedPersonaEngine_1.EnhancedPersonaEngine(dataCollectors.polygon, process.env.GEMINI_API_KEY),
    bsc: new enhancedPersonaEngine_1.EnhancedPersonaEngine(dataCollectors.bsc, process.env.GEMINI_API_KEY)
};
let detailedAnalysisService = null;
if (process.env.GEMINI_ENHANCED_API_KEY) {
    detailedAnalysisService = new detailedAnalysisService_1.DetailedAnalysisService(process.env.GEMINI_ENHANCED_API_KEY);
    console.log('🔍 Detailed Analysis Service initialized');
}
else {
    console.log('⚠️ Detailed Analysis Service disabled - GEMINI_ENHANCED_API_KEY not found');
}
console.log('🚀 Initialized data collectors for:', Object.keys(dataCollectors).join(', '));
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
app.get('/api/persona/:chain/:address', async (req, res) => {
    try {
        const { chain, address } = req.params;
        if (!personaEngines[chain]) {
            return res.status(400).json({
                error: 'Unsupported chain',
                supportedChains: Object.keys(personaEngines)
            });
        }
        if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
            return res.status(400).json({ error: 'Invalid wallet address format' });
        }
        console.log(`🔍 Analyzing ${chain} wallet: ${address}`);
        const engine = personaEngines[chain];
        const persona = await engine.generateEnhancedPersona(address);
        console.log(`✅ Analysis complete for ${address}`);
        res.json(persona);
    }
    catch (error) {
        console.error('❌ Persona analysis error:', error);
        res.status(500).json({
            error: 'Analysis failed',
            message: error.message,
            chain: req.params.chain
        });
    }
});
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
    }
    catch (error) {
        console.error('❌ Detailed analysis error:', error);
        res.status(500).json({
            error: 'Detailed analysis failed',
            message: error.message
        });
    }
});
app.post('/api/chat/:chain/:address', async (req, res) => {
    try {
        const { chain, address } = req.params;
        const { question, history, walletData } = req.body;
        if (!personaEngines[chain]) {
            return res.status(400).json({ error: 'Unsupported chain' });
        }
        console.log(`💬 Chat request for ${chain}:${address}`);
        const engine = personaEngines[chain];
        const response = await engine.chatWithWallet(question, walletData, history);
        res.json(response);
    }
    catch (error) {
        console.error('❌ Chat error:', error);
        res.status(500).json({
            error: 'Chat failed',
            message: error.message
        });
    }
});
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../../public/index.html'));
});
app.listen(PORT, () => {
    console.log(`🌟 ChainPersona AI server running on port ${PORT}`);
    console.log(`🔗 Supported chains: ${Object.keys(dataCollectors).join(', ')}`);
    console.log(`🤖 First Gemini API (Protocols + Chat): ${process.env.GEMINI_API_KEY ? 'Enabled' : 'Disabled'}`);
    console.log(`🔍 Second Gemini API (Detailed Analysis): ${detailedAnalysisService ? 'Enabled' : 'Disabled'}`);
    console.log(`📊 Transaction History: Enabled (No API calls for protocol names)`);
});
//# sourceMappingURL=server.js.map