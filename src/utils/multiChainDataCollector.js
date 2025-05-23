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
exports.MultiChainDataCollector = void 0;
const ethers_1 = require("ethers");
const axios_1 = __importDefault(require("axios"));
class MultiChainDataCollector {
    constructor(chainType = 'ethereum', providerUrl, apiKeys = {}) {
        this.chainType = chainType;
        this.apiKeys = apiKeys;
        this.provider = new ethers_1.ethers.providers.JsonRpcProvider(providerUrl);
    }
    getWalletTransactions(address, limit = 100) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.chainType === 'ethereum') {
                    return this.getEthereumTransactions(address, limit);
                }
                else if (this.chainType === 'polygon') {
                    return this.getPolygonTransactions(address, limit);
                }
                else if (this.chainType === 'bsc') {
                    return this.getBscTransactions(address, limit);
                }
                return this.getEthereumTransactions(address, limit);
            }
            catch (error) {
                console.error(`Error fetching ${this.chainType} transactions:`, error);
                return [];
            }
        });
    }
    getEthereumTransactions(address, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.apiKeys.etherscan) {
                const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${this.apiKeys.etherscan}`;
                const response = yield axios_1.default.get(url);
                if (Array.isArray(response.data.result)) {
                    return response.data.result.slice(0, limit);
                }
                else {
                    return [];
                }
            }
            else {
                console.warn('No Etherscan API key provided. Limited transaction history available.');
                return [];
            }
        });
    }
    getPolygonTransactions(address, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.apiKeys.polygonscan) {
                const url = `https://api.polygonscan.com/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${this.apiKeys.polygonscan}`;
                const response = yield axios_1.default.get(url);
                if (Array.isArray(response.data.result)) {
                    return response.data.result.slice(0, limit);
                }
                else {
                    return [];
                }
            }
            else {
                console.warn('No Polygonscan API key provided. Limited transaction history available.');
                return [];
            }
        });
    }
    getBscTransactions(address, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.apiKeys.bscscan) {
                const url = `https://api.bscscan.com/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${this.apiKeys.bscscan}`;
                const response = yield axios_1.default.get(url);
                if (Array.isArray(response.data.result)) {
                    return response.data.result.slice(0, limit);
                }
                else {
                    return [];
                }
            }
            else {
                console.warn('No BscScan API key provided. Limited transaction history available.');
                return [];
            }
        });
    }
    getTokenBalances(address) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.chainType === 'ethereum') {
                    return this.getEthereumTokenBalances(address);
                }
                else if (this.chainType === 'polygon') {
                    return this.getPolygonTokenBalances(address);
                }
                else if (this.chainType === 'bsc') {
                    return this.getBscTokenBalances(address);
                }
                return this.getEthereumTokenBalances(address);
            }
            catch (error) {
                console.error(`Error fetching ${this.chainType} token balances:`, error);
                return { erc20: [], erc721: [] };
            }
        });
    }
    getEthereumTokenBalances(address) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.apiKeys.etherscan) {
                const erc20Url = `https://api.etherscan.io/api?module=account&action=tokenlist&address=${address}&apikey=${this.apiKeys.etherscan}`;
                const erc20Response = yield axios_1.default.get(erc20Url);
                const erc721Url = `https://api.etherscan.io/api?module=account&action=tokennfttx&address=${address}&apikey=${this.apiKeys.etherscan}`;
                const erc721Response = yield axios_1.default.get(erc721Url);
                return {
                    erc20: Array.isArray(erc20Response.data.result) ? erc20Response.data.result : [],
                    erc721: Array.isArray(erc721Response.data.result) ? erc721Response.data.result : []
                };
            }
            else {
                const balance = yield this.provider.getBalance(address);
                return {
                    nativeBalance: ethers_1.ethers.utils.formatEther(balance),
                    erc20: [],
                    erc721: []
                };
            }
        });
    }
    getPolygonTokenBalances(address) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.apiKeys.polygonscan) {
                const erc20Url = `https://api.polygonscan.com/api?module=account&action=tokenlist&address=${address}&apikey=${this.apiKeys.polygonscan}`;
                const erc20Response = yield axios_1.default.get(erc20Url);
                const erc721Url = `https://api.polygonscan.com/api?module=account&action=tokennfttx&address=${address}&apikey=${this.apiKeys.polygonscan}`;
                const erc721Response = yield axios_1.default.get(erc721Url);
                return {
                    erc20: Array.isArray(erc20Response.data.result) ? erc20Response.data.result : [],
                    erc721: Array.isArray(erc721Response.data.result) ? erc721Response.data.result : []
                };
            }
            else {
                const balance = yield this.provider.getBalance(address);
                return {
                    nativeBalance: ethers_1.ethers.utils.formatEther(balance),
                    erc20: [],
                    erc721: []
                };
            }
        });
    }
    getBscTokenBalances(address) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.apiKeys.bscscan) {
                const erc20Url = `https://api.bscscan.com/api?module=account&action=tokenlist&address=${address}&apikey=${this.apiKeys.bscscan}`;
                const erc20Response = yield axios_1.default.get(erc20Url);
                const erc721Url = `https://api.bscscan.com/api?module=account&action=tokennfttx&address=${address}&apikey=${this.apiKeys.bscscan}`;
                const erc721Response = yield axios_1.default.get(erc721Url);
                return {
                    erc20: Array.isArray(erc20Response.data.result) ? erc20Response.data.result : [],
                    erc721: Array.isArray(erc721Response.data.result) ? erc721Response.data.result : []
                };
            }
            else {
                const balance = yield this.provider.getBalance(address);
                return {
                    nativeBalance: ethers_1.ethers.utils.formatEther(balance),
                    erc20: [],
                    erc721: []
                };
            }
        });
    }
    getContractInteractions(address, limit = 100) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transactions = yield this.getWalletTransactions(address, limit);
                if (!Array.isArray(transactions)) {
                    console.warn('Transactions is not an array, returning empty array');
                    return [];
                }
                return transactions.filter((tx) => tx.input && tx.input !== '0x' && tx.input !== '0x0');
            }
            catch (error) {
                console.error(`Error fetching ${this.chainType} contract interactions:`, error);
                return [];
            }
        });
    }
    getChainType() {
        return this.chainType;
    }
}
exports.MultiChainDataCollector = MultiChainDataCollector;
