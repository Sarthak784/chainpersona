export interface IDataCollector {
  getWalletTransactions(address: string, limit?: number): Promise<any[]>;
  getTokenBalances(address: string): Promise<any>;
  getContractInteractions(address: string, limit?: number): Promise<any[]>;
  getChainType(): string;
}
