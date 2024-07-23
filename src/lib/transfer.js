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
exports.transferSPLTokenBalance = exports.transferSPLTokens = exports.transferSOLBalance = exports.transferSOL = void 0;
const anchor_1 = require("@project-serum/anchor");
const bytes_1 = require("@project-serum/anchor/dist/cjs/utils/bytes");
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const tokens_1 = require("./tokens");
const accounts_1 = require("./accounts");
function transferSOL(connection_1, transferAmount_1, fromPrivateKey_1, toPublicKeyString_1) {
    return __awaiter(this, arguments, void 0, function* (connection, transferAmount, fromPrivateKey, toPublicKeyString, priorityFee = 25000) {
        const fromWallet = new anchor_1.Wallet(web3_js_1.Keypair.fromSecretKey(bytes_1.bs58.decode(fromPrivateKey)));
        // Define the amount of lamports to transfer
        const transferAmountInLamports = (transferAmount * web3_js_1.LAMPORTS_PER_SOL).toFixed(0);
        const toPublicKey = new web3_js_1.PublicKey(toPublicKeyString);
        const PRIORITY_FEE_INSTRUCTIONS = web3_js_1.ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: priorityFee,
        });
        // Create the transaction
        const transaction = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.transfer({
            fromPubkey: fromWallet.publicKey,
            toPubkey: toPublicKey,
            lamports: transferAmountInLamports,
        }), PRIORITY_FEE_INSTRUCTIONS);
        return (0, web3_js_1.sendAndConfirmTransaction)(connection, transaction, [fromWallet.payer]);
    });
}
exports.transferSOL = transferSOL;
function transferSOLBalance(connection_1, fromPrivateKey_1, toPublicKeyString_1) {
    return __awaiter(this, arguments, void 0, function* (connection, fromPrivateKey, toPublicKeyString, fee = 7000, priorityFee = 25000) {
        let transferAmountInLamports;
        try {
            const balance = yield (0, tokens_1.getSolBalance)(connection, (0, accounts_1.base58EncodedPrivateKeyToBase58EncodedPublicKey)(fromPrivateKey));
            transferAmountInLamports = balance - fee;
        }
        catch (error) {
            throw Error(`Error getting balance: ${error.message}`);
        }
        if (transferAmountInLamports < 0)
            throw Error("Insufficient balance.");
        return transferSOL(connection, transferAmountInLamports / web3_js_1.LAMPORTS_PER_SOL, fromPrivateKey, toPublicKeyString, priorityFee);
    });
}
exports.transferSOLBalance = transferSOLBalance;
function transferSPLTokens(connection_1, tokenAddress_1, transferAmount_1, fromPrivateKeyString_1, toPublicKeyString_1) {
    return __awaiter(this, arguments, void 0, function* (connection, tokenAddress, transferAmount, fromPrivateKeyString, toPublicKeyString, priorityFee = 25000) {
        const fromKeyPair = web3_js_1.Keypair.fromSecretKey(bytes_1.bs58.decode(fromPrivateKeyString));
        const toPublicKey = new web3_js_1.PublicKey(toPublicKeyString);
        const senderTokenAccount = yield (0, spl_token_1.getAssociatedTokenAddress)(new web3_js_1.PublicKey(tokenAddress), fromKeyPair.publicKey);
        const recipientTokenAccount = yield (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, fromKeyPair, new web3_js_1.PublicKey(tokenAddress), toPublicKey);
        try {
            const decimals = yield (0, tokens_1.getTokenDecimals)(connection, tokenAddress, fromKeyPair);
            const [integerPart, fractionalPart] = transferAmount.toString().split(".");
            const integerBigInt = BigInt(integerPart);
            const fractionalBigInt = fractionalPart
                ? BigInt(fractionalPart)
                : BigInt(0);
            const amountToTransfer = integerBigInt * BigInt(10) ** BigInt(decimals) + fractionalBigInt;
            const PRIORITY_FEE_INSTRUCTIONS = web3_js_1.ComputeBudgetProgram.setComputeUnitPrice({
                microLamports: priorityFee,
            });
            // Create the transaction
            const transaction = new web3_js_1.Transaction().add((0, spl_token_1.createTransferInstruction)(senderTokenAccount, recipientTokenAccount.address, fromKeyPair.publicKey, amountToTransfer), PRIORITY_FEE_INSTRUCTIONS);
            return (0, web3_js_1.sendAndConfirmTransaction)(connection, transaction, [fromKeyPair]);
        }
        catch (error) {
            throw Error(`Getting token info failed: ${error.message}`);
        }
    });
}
exports.transferSPLTokens = transferSPLTokens;
function transferSPLTokenBalance(connection_1, tokenAddress_1, fromPrivateKeyString_1, toPublicKeyString_1) {
    return __awaiter(this, arguments, void 0, function* (connection, tokenAddress, fromPrivateKeyString, toPublicKeyString, priorityFee = 25000) {
        let amountToTransfer;
        try {
            const balance = yield (0, tokens_1.getTokenBalance)(connection, tokenAddress, (0, accounts_1.base58EncodedPrivateKeyToBase58EncodedPublicKey)(fromPrivateKeyString));
            amountToTransfer = balance;
            if (amountToTransfer < 0)
                throw Error("Insufficient funds");
        }
        catch (error) {
            throw Error(`Error getting balance: ${error.message}`);
        }
        return transferSPLTokens(connection, tokenAddress, amountToTransfer, fromPrivateKeyString, toPublicKeyString, priorityFee);
    });
}
exports.transferSPLTokenBalance = transferSPLTokenBalance;
