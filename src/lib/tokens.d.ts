import { Connection, Keypair } from "@solana/web3.js";
export declare function getSolBalance(connection: Connection, accountAddress: string): Promise<number>;
export declare function getTokenBalance(connection: Connection, tokenAddress: string, owner: string): Promise<number>;
export declare function getTokenDecimals(connection: Connection, tokenAddress: string, keyPair: Keypair): Promise<number>;
//# sourceMappingURL=tokens.d.ts.map