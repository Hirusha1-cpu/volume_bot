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
exports.getTokenDecimals = exports.getTokenBalance = exports.getSolBalance = void 0;
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
function getSolBalance(connection, accountAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        const balance = connection.getBalance(new web3_js_1.PublicKey(accountAddress));
        return balance;
    });
}
exports.getSolBalance = getSolBalance;
function getTokenBalance(connection, tokenAddress, owner) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        try {
            const accountInfo = yield connection.getParsedAccountInfo((0, spl_token_1.getAssociatedTokenAddressSync)(new web3_js_1.PublicKey(tokenAddress), new web3_js_1.PublicKey(owner)));
            if (!((_a = accountInfo.value) === null || _a === void 0 ? void 0 : _a.data)) {
                throw Error("Error locating associated token account");
            }
            const { uiAmount } = (_e = (_d = (_c = (_b = accountInfo.value) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.parsed) === null || _d === void 0 ? void 0 : _d.info) === null || _e === void 0 ? void 0 : _e.tokenAmount;
            return uiAmount;
        }
        catch (error) {
            throw Error(`Error getting token balance: ${error.message}`);
        }
    });
}
exports.getTokenBalance = getTokenBalance;
function getTokenDecimals(connection, tokenAddress, keyPair) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        try {
            const accountInfo = yield connection.getParsedAccountInfo((yield (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, keyPair, new web3_js_1.PublicKey(tokenAddress), keyPair.publicKey)).address);
            if (!((_a = accountInfo.value) === null || _a === void 0 ? void 0 : _a.data)) {
                throw Error("Error locating associated token account");
            }
            const { decimals } = (_e = (_d = (_c = (_b = accountInfo.value) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.parsed) === null || _d === void 0 ? void 0 : _d.info) === null || _e === void 0 ? void 0 : _e.tokenAmount;
            return decimals;
        }
        catch (error) {
            throw Error(`Error getting token balance: ${error.message}`);
        }
    });
}
exports.getTokenDecimals = getTokenDecimals;
