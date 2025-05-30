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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonaEngine = exports.PersonaArchetype = void 0;
var PersonaArchetype;
(function (PersonaArchetype) {
    PersonaArchetype["DEFI_USER"] = "DeFi Power User";
    PersonaArchetype["NFT_COLLECTOR"] = "NFT Collector";
    PersonaArchetype["GOVERNANCE_PARTICIPANT"] = "Governance Participant";
    PersonaArchetype["TRADER"] = "Trader";
    PersonaArchetype["LONG_TERM_INVESTOR"] = "Long-term Investor";
    PersonaArchetype["DEVELOPER"] = "Developer/Builder";
    PersonaArchetype["GAMING_ENTHUSIAST"] = "Gaming Enthusiast";
})(PersonaArchetype = exports.PersonaArchetype || (exports.PersonaArchetype = {}));
class PersonaEngine {
    constructor(dataCollector) {
        this.protocols = {
            '0x7a250d5630b4cf539739df2c5dacb4c659f2488d': { name: 'Uniswap V2', category: 'defi' },
            '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45': { name: 'Uniswap V3', category: 'defi' },
            '0x00000000219ab540356cbb839cbe05303d7705fa': { name: 'Ethereum 2.0 Deposit', category: 'staking' },
            '0x7be8076f4ea4a4ad08075c2508e481d6c946d12b': { name: 'OpenSea', category: 'nft' },
            '0x7f268357a8c2552623316e2562d90e642bb538e5': { name: 'Rarible', category: 'nft' },
            '0x06012c8cf97bead5deae237070f9587f8e7a266d': { name: 'CryptoKitties', category: 'gaming' },
            '0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb': { name: 'CryptoPunks', category: 'nft' },
            '0xc0da01a04c3f3e0be433606045bb7017a7323e38': { name: 'Compound Governance', category: 'governance' },
            '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2': { name: 'Maker', category: 'governance' },
        };
        this.dataCollector = dataCollector;
    }
    generatePersona(address) {
        return __awaiter(this, void 0, void 0, function* () {
            const transactions = yield this.dataCollector.getWalletTransactions(address, 200);
            const tokenBalances = yield this.dataCollector.getTokenBalances(address);
            const contractInteractions = yield this.dataCollector.getContractInteractions(address);
            const persona = {
                address,
                archetypes: this.initializeArchetypes(),
                riskScore: 50,
                activityLevel: this.calculateActivityLevel(transactions),
                topProtocols: this.identifyTopProtocols(contractInteractions),
                securityScore: this.calculateSecurityScore(transactions, contractInteractions),
                behavioralTraits: [],
                recommendedDapps: [],
            };
            this.analyzeTransactionPatterns(persona, transactions);
            this.analyzeTokenHoldings(persona, tokenBalances);
            this.analyzeContractInteractions(persona, contractInteractions);
            this.identifyBehavioralTraits(persona, transactions, contractInteractions);
            this.generateRecommendations(persona);
            return persona;
        });
    }
    initializeArchetypes() {
        const archetypes = {};
        Object.values(PersonaArchetype).forEach(archetype => {
            archetypes[archetype] = 0;
        });
        return archetypes;
    }
    calculateActivityLevel(transactions) {
        if (!transactions || !Array.isArray(transactions) || transactions.length === 0)
            return 0;
        const currentTime = Date.now() / 1000;
        const txTimes = transactions.map(tx => parseInt(tx.timeStamp || '0'));
        const mostRecentTx = Math.max(...txTimes);
        const oldestTx = Math.min(...txTimes);
        const recencyFactor = Math.max(0, 100 - (currentTime - mostRecentTx) / (24 * 60 * 60) * 2);
        const timeSpan = mostRecentTx - oldestTx;
        const txPerDay = timeSpan > 0 ? (transactions.length / (timeSpan / (24 * 60 * 60))) : 0;
        const frequencyFactor = Math.min(100, txPerDay * 20);
        return Math.round((recencyFactor * 0.4) + (frequencyFactor * 0.6));
    }
    identifyTopProtocols(contractInteractions) {
        if (!contractInteractions.length)
            return [];
        const interactionCounts = {};
        contractInteractions.forEach(tx => {
            var _a;
            const address = (_a = tx.to) === null || _a === void 0 ? void 0 : _a.toLowerCase();
            if (address) {
                interactionCounts[address] = (interactionCounts[address] || 0) + 1;
            }
        });
        const sortedAddresses = Object.keys(interactionCounts).sort((a, b) => interactionCounts[b] - interactionCounts[a]).slice(0, 5);
        return sortedAddresses.map(addr => { var _a; return ((_a = this.protocols[addr]) === null || _a === void 0 ? void 0 : _a.name) || `Unknown Protocol (${addr.substring(0, 8)}...)`; });
    }
    calculateSecurityScore(transactions, contractInteractions) {
        let score = 50;
        const riskyInteractions = contractInteractions.filter(tx => {
            var _a;
            const riskyAddresses = ['0x...', '0x...'];
            return riskyAddresses.includes((_a = tx.to) === null || _a === void 0 ? void 0 : _a.toLowerCase());
        }).length;
        score -= riskyInteractions * 5;
        const uniqueRecipients = new Set(transactions.map(tx => { var _a; return (_a = tx.to) === null || _a === void 0 ? void 0 : _a.toLowerCase(); })).size;
        const recipientRatio = transactions.length > 0 ? uniqueRecipients / transactions.length : 1;
        if (recipientRatio < 0.2)
            score += 15;
        else if (recipientRatio < 0.5)
            score += 5;
        return Math.max(0, Math.min(100, score));
    }
    analyzeTransactionPatterns(persona, transactions) {
        if (!transactions.length)
            return;
        const values = transactions.map(tx => parseFloat(tx.value || '0'));
        const avgValue = values.reduce((sum, val) => sum + val, 0) / values.length;
        const timestamps = transactions.map(tx => parseInt(tx.timeStamp || '0')).sort();
        const timeDiffs = [];
        for (let i = 1; i < timestamps.length; i++) {
            timeDiffs.push(timestamps[i] - timestamps[i - 1]);
        }
        const avgTimeBetweenTx = timeDiffs.length ?
            timeDiffs.reduce((sum, diff) => sum + diff, 0) / timeDiffs.length : 0;
        if (avgTimeBetweenTx < 24 * 60 * 60) {
            persona.archetypes[PersonaArchetype.TRADER] += 30;
        }
        if (avgTimeBetweenTx > 30 * 24 * 60 * 60 && avgValue > 1) {
            persona.archetypes[PersonaArchetype.LONG_TERM_INVESTOR] += 30;
        }
    }
    analyzeTokenHoldings(persona, tokenBalances) {
        const erc20Tokens = Array.isArray(tokenBalances.erc20) ? tokenBalances.erc20 : [];
        const erc721Tokens = Array.isArray(tokenBalances.erc721) ? tokenBalances.erc721 : [];
        if (erc721Tokens.length > 5) {
            persona.archetypes[PersonaArchetype.NFT_COLLECTOR] += 20 + Math.min(30, erc721Tokens.length);
        }
        if (erc20Tokens.length > 5) {
            persona.archetypes[PersonaArchetype.DEFI_USER] += 15;
        }
        const governanceTokens = erc20Tokens.filter((token) => ['COMP', 'UNI', 'AAVE', 'MKR'].includes(token.symbol));
        if (governanceTokens.length > 0) {
            persona.archetypes[PersonaArchetype.GOVERNANCE_PARTICIPANT] += 15 * governanceTokens.length;
        }
    }
    analyzeContractInteractions(persona, contractInteractions) {
        if (!contractInteractions.length)
            return;
        const categoryCounts = {};
        contractInteractions.forEach(tx => {
            var _a;
            const address = (_a = tx.to) === null || _a === void 0 ? void 0 : _a.toLowerCase();
            const protocol = this.protocols[address];
            if (protocol) {
                categoryCounts[protocol.category] = (categoryCounts[protocol.category] || 0) + 1;
            }
        });
        if (categoryCounts['defi']) {
            persona.archetypes[PersonaArchetype.DEFI_USER] += Math.min(40, categoryCounts['defi'] * 2);
        }
        if (categoryCounts['nft']) {
            persona.archetypes[PersonaArchetype.NFT_COLLECTOR] += Math.min(40, categoryCounts['nft'] * 2);
        }
        if (categoryCounts['gaming']) {
            persona.archetypes[PersonaArchetype.GAMING_ENTHUSIAST] += Math.min(40, categoryCounts['gaming'] * 3);
        }
        if (categoryCounts['governance']) {
            persona.archetypes[PersonaArchetype.GOVERNANCE_PARTICIPANT] += Math.min(40, categoryCounts['governance'] * 4);
        }
        const contractDeployments = contractInteractions.filter(tx => !tx.to);
        if (contractDeployments.length > 0) {
            persona.archetypes[PersonaArchetype.DEVELOPER] += 40 + Math.min(40, contractDeployments.length * 10);
        }
    }
    identifyBehavioralTraits(persona, transactions, contractInteractions) {
        const traits = [];
        if (persona.riskScore > 70) {
            traits.push('High Risk Tolerance');
        }
        else if (persona.riskScore < 30) {
            traits.push('Conservative');
        }
        if (persona.activityLevel > 70) {
            traits.push('Very Active');
        }
        else if (persona.activityLevel < 30) {
            traits.push('Passive');
        }
        const uniqueContracts = new Set(contractInteractions.map(tx => { var _a; return (_a = tx.to) === null || _a === void 0 ? void 0 : _a.toLowerCase(); })).size;
        if (uniqueContracts > 10) {
            traits.push('Highly Diversified');
        }
        else if (uniqueContracts < 3 && contractInteractions.length > 5) {
            traits.push('Protocol Loyal');
        }
        const timestamps = transactions.map(tx => parseInt(tx.timeStamp || '0'));
        const hours = timestamps.map(ts => new Date(ts * 1000).getHours());
        const hourCounts = {};
        hours.forEach(hour => {
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });
        const maxHourCount = Math.max(...Object.values(hourCounts));
        const maxHour = Object.keys(hourCounts).find(hour => hourCounts[parseInt(hour)] === maxHourCount);
        if (maxHourCount > transactions.length * 0.4) {
            const hourNum = parseInt(maxHour || '0');
            const timeOfDay = hourNum < 12 ? 'Morning' : hourNum < 18 ? 'Afternoon' : 'Evening';
            traits.push(`${timeOfDay} Trader`);
        }
        persona.behavioralTraits = traits;
    }
    generateRecommendations(persona) {
        const recommendations = [];
        const dominantArchetype = Object.entries(persona.archetypes)
            .sort((a, b) => b[1] - a[1])[0][0];
        switch (dominantArchetype) {
            case PersonaArchetype.DEFI_USER:
                recommendations.push('Aave', 'Compound', 'Curve Finance');
                break;
            case PersonaArchetype.NFT_COLLECTOR:
                recommendations.push('SuperRare', 'Foundation', 'Blur');
                break;
            case PersonaArchetype.GOVERNANCE_PARTICIPANT:
                recommendations.push('Snapshot', 'Tally', 'Boardroom');
                break;
            case PersonaArchetype.TRADER:
                recommendations.push('1inch', 'dYdX', 'GMX');
                break;
            case PersonaArchetype.LONG_TERM_INVESTOR:
                recommendations.push('Lido', 'Rocket Pool', 'Index Coop');
                break;
            case PersonaArchetype.DEVELOPER:
                recommendations.push('Hardhat', 'Tenderly', 'Alchemy');
                break;
            case PersonaArchetype.GAMING_ENTHUSIAST:
                recommendations.push('Axie Infinity', 'Gods Unchained', 'Illuvium');
                break;
        }
        if (persona.securityScore < 50) {
            recommendations.push('Revoke.cash', 'Wallet Guard', 'DeFi Saver');
        }
        persona.recommendedDapps = recommendations;
    }
}
exports.PersonaEngine = PersonaEngine;
