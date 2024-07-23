import { LiquidityPoolKeysV4, Percent, TokenAmount } from "@raydium-io/raydium-sdk";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
export declare function swap(connection: Connection, ownerKeyPair: Keypair, amount: number, tokenAddress: string, slippage: number, poolKeys: LiquidityPoolKeysV4, maxFeeInLamports?: number, fixedSide?: "in" | "out", shouldConfirm?: boolean): Promise<string | Error>;
export declare function getOwnerTokenAccounts(connection: Connection, ownerAddress: PublicKey, programId?: PublicKey): Promise<{
    pubkey: PublicKey;
    programId: PublicKey;
    accountInfo: {
        mint: PublicKey;
        delegate: PublicKey;
        owner: PublicKey;
        state: number;
        amount: any;
        delegateOption: number;
        isNativeOption: number;
        isNative: any;
        delegatedAmount: any;
        closeAuthorityOption: number;
        closeAuthority: PublicKey;
    };
}[]>;
export declare function calcAmountOut(connection: Connection, poolKeys: LiquidityPoolKeysV4, amount: number, slippageAmount: Number, swapInDirection: boolean): Promise<{
    amountIn: TokenAmount;
    amountOut: TokenAmount | import("@raydium-io/raydium-sdk").CurrencyAmount;
    minAmountOut: TokenAmount | import("@raydium-io/raydium-sdk").CurrencyAmount;
    currentPrice: import("@raydium-io/raydium-sdk").Price;
    executionPrice: import("@raydium-io/raydium-sdk").Price | null;
    priceImpact: Percent;
    fee: import("@raydium-io/raydium-sdk").CurrencyAmount;
}>;
export declare function calcAmountIn(connection: Connection, poolKeys: LiquidityPoolKeysV4, amount: number, slippageAmount: Number, swapInDirection: boolean): Promise<{
    amountIn: TokenAmount | import("@raydium-io/raydium-sdk").CurrencyAmount;
    amountOut: TokenAmount;
    maxAmountIn: TokenAmount | import("@raydium-io/raydium-sdk").CurrencyAmount;
    currentPrice: import("@raydium-io/raydium-sdk").Price;
    executionPrice: import("@raydium-io/raydium-sdk").Price | null;
    priceImpact: Percent;
}>;
//# sourceMappingURL=swap.d.ts.map