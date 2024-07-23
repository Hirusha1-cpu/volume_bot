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
exports.calcAmountIn = exports.calcAmountOut = exports.getOwnerTokenAccounts = exports.swap = void 0;
const anchor_1 = require("@project-serum/anchor");
const raydium_sdk_1 = require("@raydium-io/raydium-sdk");
const web3_js_1 = require("@solana/web3.js");
function swap(connection_1, ownerKeyPair_1, amount_1, tokenAddress_1, slippage_1, poolKeys_1) {
    return __awaiter(this, arguments, void 0, function* (connection, ownerKeyPair, amount, tokenAddress, slippage, poolKeys, maxFeeInLamports = 10000, fixedSide = "in", shouldConfirm = false) {
        var _a;
        const directionIn = poolKeys.quoteMint.toString() === tokenAddress;
        try {
            let finalAmountIn, finalAmountOut;
            if (fixedSide === "in") {
                const { minAmountOut, amountIn } = yield calcAmountOut(connection, poolKeys, amount, slippage, directionIn);
                finalAmountIn = amountIn;
                finalAmountOut = minAmountOut;
            }
            else {
                const { maxAmountIn, amountOut } = yield calcAmountIn(connection, poolKeys, amount, slippage, directionIn);
                finalAmountIn = maxAmountIn;
                finalAmountOut = amountOut;
            }
            try {
                const swapTransaction = yield raydium_sdk_1.Liquidity.makeSwapInstructionSimple({
                    connection,
                    makeTxVersion: 0,
                    poolKeys,
                    userKeys: {
                        tokenAccounts: yield getOwnerTokenAccounts(connection, ownerKeyPair.publicKey),
                        owner: ownerKeyPair.publicKey,
                    },
                    amountIn: finalAmountIn,
                    amountOut: finalAmountOut,
                    fixedSide,
                    config: {
                        bypassAssociatedCheck: false,
                    },
                    computeBudgetConfig: {
                        microLamports: maxFeeInLamports,
                    },
                });
                try {
                    const recentBlockhashForSwap = yield connection.getLatestBlockhash();
                    const instructions = swapTransaction.innerTransactions[0].instructions.filter(Boolean);
                    const versionedTransaction = new web3_js_1.VersionedTransaction(new web3_js_1.TransactionMessage({
                        payerKey: ownerKeyPair.publicKey,
                        recentBlockhash: recentBlockhashForSwap.blockhash,
                        instructions: instructions,
                    }).compileToV0Message());
                    versionedTransaction.sign([ownerKeyPair]);
                    try {
                        const txId = yield connection.sendTransaction(versionedTransaction, {
                            skipPreflight: true,
                            maxRetries: 2,
                        });
                        if (shouldConfirm) {
                            try {
                                const data = yield connection.confirmTransaction({
                                    blockhash: recentBlockhashForSwap.blockhash,
                                    lastValidBlockHeight: recentBlockhashForSwap.lastValidBlockHeight,
                                    signature: txId,
                                });
                                if ((_a = data === null || data === void 0 ? void 0 : data.value) === null || _a === void 0 ? void 0 : _a.err) {
                                    return Promise.reject(Error("Transaction not confirmed"));
                                }
                                return txId;
                            }
                            catch (error) {
                                return Promise.reject(Error(`Transaction not confirmed: ${error.message}`));
                            }
                        }
                        else {
                            return txId;
                        }
                    }
                    catch (error) {
                        return Promise.reject(Error(`Sending transaction failed: ${error.message}`));
                    }
                }
                catch (error) {
                    return Promise.reject(Error(`Getting recent block hash faield: ${error.message}`));
                }
            }
            catch (error) {
                return Promise.reject(Error(`Making swap transaction failed: ${error.message}`));
            }
        }
        catch (error) {
            if (fixedSide === "in") {
                return Promise.reject(Error(`Calculating output amounts failed: ${error.message}`));
            }
            else {
                return Promise.reject(Error(`Calculating input amounts failed: ${error.message}`));
            }
        }
    });
}
exports.swap = swap;
function getOwnerTokenAccounts(connection_1, ownerAddress_1) {
    return __awaiter(this, arguments, void 0, function* (connection, ownerAddress, programId = raydium_sdk_1.TOKEN_PROGRAM_ID) {
        const walletTokenAccount = yield connection.getTokenAccountsByOwner(ownerAddress, {
            programId,
        });
        return walletTokenAccount.value.map((account) => ({
            pubkey: account.pubkey,
            programId: account.account.owner,
            accountInfo: raydium_sdk_1.SPL_ACCOUNT_LAYOUT.decode(account.account.data),
        }));
    });
}
exports.getOwnerTokenAccounts = getOwnerTokenAccounts;
function calcAmountOut(connection, poolKeys, amount, slippageAmount, swapInDirection) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        let poolInfo;
        try {
            poolInfo = yield raydium_sdk_1.Liquidity.fetchInfo({
                connection: connection,
                poolKeys,
            });
        }
        catch (error) {
            const quoteVault = yield connection.getParsedAccountInfo(poolKeys.quoteVault, "confirmed");
            const baseVault = yield connection.getParsedAccountInfo(poolKeys.baseVault, "confirmed");
            poolInfo = {
                status: new anchor_1.BN(),
                baseDecimals: poolKeys.baseDecimals,
                quoteDecimals: poolKeys.quoteDecimals,
                lpDecimals: poolKeys.lpDecimals,
                baseReserve: new anchor_1.BN(((_a = baseVault.value) === null || _a === void 0 ? void 0 : _a.data).parsed.info.tokenAmount.amount),
                quoteReserve: new anchor_1.BN(((_b = quoteVault.value) === null || _b === void 0 ? void 0 : _b.data).parsed.info.tokenAmount.amount),
                lpSupply: new anchor_1.BN(((_c = baseVault.value) === null || _c === void 0 ? void 0 : _c.data).parsed.info.tokenAmount.amount),
                startTime: new anchor_1.BN("0"),
            };
        }
        let currencyInMint = poolKeys.baseMint;
        let currencyInDecimals = poolKeys.baseDecimals;
        let currencyOutMint = poolKeys.quoteMint;
        let currencyOutDecimals = poolKeys.quoteDecimals;
        if (!swapInDirection) {
            currencyInMint = poolKeys.quoteMint;
            currencyInDecimals = poolKeys.quoteDecimals;
            currencyOutMint = poolKeys.baseMint;
            currencyOutDecimals = poolKeys.baseDecimals;
        }
        const currencyIn = new raydium_sdk_1.Token(raydium_sdk_1.TOKEN_PROGRAM_ID, currencyInMint, currencyInDecimals);
        const amountIn = new raydium_sdk_1.TokenAmount(currencyIn, amount, false);
        const currencyOut = new raydium_sdk_1.Token(raydium_sdk_1.TOKEN_PROGRAM_ID, currencyOutMint, currencyOutDecimals);
        const slippage = new raydium_sdk_1.Percent((slippageAmount.valueOf() * 100).toFixed(0), 10000);
        const { amountOut, minAmountOut, currentPrice, executionPrice, priceImpact, fee, } = raydium_sdk_1.Liquidity.computeAmountOut({
            poolKeys,
            poolInfo,
            amountIn,
            currencyOut,
            slippage,
        });
        return {
            amountIn,
            amountOut,
            minAmountOut,
            currentPrice,
            executionPrice,
            priceImpact,
            fee,
        };
    });
}
exports.calcAmountOut = calcAmountOut;
function calcAmountIn(connection, poolKeys, amount, slippageAmount, swapInDirection) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        let poolInfo;
        try {
            poolInfo = yield raydium_sdk_1.Liquidity.fetchInfo({
                connection: connection,
                poolKeys,
            });
        }
        catch (error) {
            const quoteVault = yield connection.getParsedAccountInfo(poolKeys.quoteVault, "confirmed");
            const baseVault = yield connection.getParsedAccountInfo(poolKeys.baseVault, "confirmed");
            poolInfo = {
                status: new anchor_1.BN(),
                baseDecimals: poolKeys.baseDecimals,
                quoteDecimals: poolKeys.quoteDecimals,
                lpDecimals: poolKeys.lpDecimals,
                baseReserve: new anchor_1.BN(((_a = baseVault.value) === null || _a === void 0 ? void 0 : _a.data).parsed.info.tokenAmount.amount),
                quoteReserve: new anchor_1.BN(((_b = quoteVault.value) === null || _b === void 0 ? void 0 : _b.data).parsed.info.tokenAmount.amount),
                lpSupply: new anchor_1.BN(((_c = baseVault.value) === null || _c === void 0 ? void 0 : _c.data).parsed.info.tokenAmount.amount),
                startTime: new anchor_1.BN("0"),
            };
        }
        let currencyInMint = poolKeys.baseMint;
        let currencyInDecimals = poolKeys.baseDecimals;
        let currencyOutMint = poolKeys.quoteMint;
        let currencyOutDecimals = poolKeys.quoteDecimals;
        if (!swapInDirection) {
            currencyInMint = poolKeys.quoteMint;
            currencyInDecimals = poolKeys.quoteDecimals;
            currencyOutMint = poolKeys.baseMint;
            currencyOutDecimals = poolKeys.baseDecimals;
        }
        const currencyOut = new raydium_sdk_1.Token(raydium_sdk_1.TOKEN_PROGRAM_ID, currencyOutMint, currencyOutDecimals);
        const amountOut = new raydium_sdk_1.TokenAmount(currencyOut, amount, false);
        const currencyIn = new raydium_sdk_1.Token(raydium_sdk_1.TOKEN_PROGRAM_ID, currencyInMint, currencyInDecimals);
        const slippage = new raydium_sdk_1.Percent((slippageAmount.valueOf() * 100).toFixed(0), 10000);
        const { amountIn, maxAmountIn, currentPrice, executionPrice, priceImpact } = raydium_sdk_1.Liquidity.computeAmountIn({
            poolKeys,
            poolInfo,
            amountOut,
            currencyIn,
            slippage,
        });
        return {
            amountIn,
            amountOut,
            maxAmountIn,
            currentPrice,
            executionPrice,
            priceImpact,
        };
    });
}
exports.calcAmountIn = calcAmountIn;
