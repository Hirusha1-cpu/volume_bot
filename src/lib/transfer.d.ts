import { Connection } from "@solana/web3.js";
export declare function transferSOL(connection: Connection, transferAmount: number, fromPrivateKey: string, toPublicKeyString: string, priorityFee?: number): Promise<string>;
export declare function transferSOLBalance(connection: Connection, fromPrivateKey: string, toPublicKeyString: string, fee?: number, priorityFee?: number): Promise<string>;
export declare function transferSPLTokens(connection: Connection, tokenAddress: string, transferAmount: number, fromPrivateKeyString: string, toPublicKeyString: string, priorityFee?: number): Promise<string>;
export declare function transferSPLTokenBalance(connection: Connection, tokenAddress: string, fromPrivateKeyString: string, toPublicKeyString: string, priorityFee?: number): Promise<string>;
//# sourceMappingURL=transfer.d.ts.map