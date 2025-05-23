"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const multiChainDataCollector_1 = require("../utils/multiChainDataCollector");
const personaEngine_1 = require("../models/personaEngine");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static('public'));
const ethereumCollector = new multiChainDataCollector_1.MultiChainDataCollector('ethereum', process.env.ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/your-infura-key', {
    etherscan: process.env.ETHERSCAN_API_KEY || '',
});
const polygonCollector = new multiChainDataCollector_1.MultiChainDataCollector('polygon', process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com', {
    polygonscan: process.env.POLYGONSCAN_API_KEY || '',
});
const bscCollector = new multiChainDataCollector_1.MultiChainDataCollector('bsc', process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org/', {
    bscscan: process.env.BSCSCAN_API_KEY || '',
});
const ethereumPersonaEngine = new personaEngine_1.PersonaEngine(ethereumCollector);
const polygonPersonaEngine = new personaEngine_1.PersonaEngine(polygonCollector);
const bscPersonaEngine = new personaEngine_1.PersonaEngine(bscCollector);
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy' });
});
app.get('/api/persona/:chain/:address', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { address, chain } = req.params;
        if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
            return res.status(400).json({ error: 'Invalid Ethereum address format' });
        }
        let persona;
        if (chain === 'polygon') {
            persona = yield polygonPersonaEngine.generatePersona(address);
        }
        else if (chain === 'bsc') {
            persona = yield bscPersonaEngine.generatePersona(address);
        }
        else {
            persona = yield ethereumPersonaEngine.generatePersona(address);
        }
        res.json(persona);
    }
    catch (error) {
        console.error('Error generating persona:', error);
        res.status(500).json({ error: 'Failed to generate persona' });
    }
}));
app.get('/api/persona/:address', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { address } = req.params;
        if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
            return res.status(400).json({ error: 'Invalid Ethereum address format' });
        }
        const persona = yield ethereumPersonaEngine.generatePersona(address);
        res.json(persona);
    }
    catch (error) {
        console.error('Error generating persona:', error);
        res.status(500).json({ error: 'Failed to generate persona' });
    }
}));
app.listen(PORT, () => {
    console.log(`ChainPersona API server running on port ${PORT}`);
});
