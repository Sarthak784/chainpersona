import { IDataCollector } from '../utils/dataCollector.interface';
export declare enum PersonaArchetype {
    DEFI_USER = "DeFi Power User",
    NFT_COLLECTOR = "NFT Collector",
    GOVERNANCE_PARTICIPANT = "Governance Participant",
    TRADER = "Trader",
    LONG_TERM_INVESTOR = "Long-term Investor",
    DEVELOPER = "Developer/Builder",
    GAMING_ENTHUSIAST = "Gaming Enthusiast"
}
export interface WalletPersona {
    address: string;
    archetypes: Record<PersonaArchetype, number>;
    riskScore: number;
    activityLevel: number;
    topProtocols: string[];
    securityScore: number;
    behavioralTraits: string[];
    recommendedDapps: string[];
}
export declare class PersonaEngine {
    private dataCollector;
    private protocols;
    constructor(dataCollector: IDataCollector);
    generatePersona(address: string): Promise<WalletPersona>;
    private initializeArchetypes;
    private calculateActivityLevel;
    private identifyTopProtocols;
    private calculateSecurityScore;
    private analyzeTransactionPatterns;
    private analyzeTokenHoldings;
    private analyzeContractInteractions;
    private identifyBehavioralTraits;
    private generateRecommendations;
}
//# sourceMappingURL=personaEngine.d.ts.map