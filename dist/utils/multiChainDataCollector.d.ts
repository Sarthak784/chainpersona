import { IDataCollector } from './dataCollector.interface';
export declare class MultiChainDataCollector implements IDataCollector {
    private provider;
    private apiKeys;
    private chainType;
    constructor(chainType: string | undefined, providerUrl: string, apiKeys?: Record<string, string>);
    getChainType(): string;
    getWalletTransactions(address: string, limit?: number): Promise<any[]>;
    private getEthereumTransactions;
    private getPolygonTransactions;
    private getBscTransactions;
    getTokenBalances(address: string): Promise<any>;
    private getEthereumTokenBalances;
    private getPolygonTokenBalances;
    private getBscTokenBalances;
    getContractInteractions(address: string, limit?: number): Promise<any[]>;
}
//# sourceMappingURL=multiChainDataCollector.d.ts.map