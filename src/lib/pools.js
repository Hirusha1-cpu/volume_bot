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
exports.fetchPoolKeys = void 0;
const raydium_sdk_1 = require("@raydium-io/raydium-sdk");
const web3_js_1 = require("@solana/web3.js");
const const_1 = require("./const");
// Define a function to fetch and decode Market accounts
function fetchPoolKeys(connection_1, token1Address_1, token2Address_1) {
    return __awaiter(this, arguments, void 0, function* (connection, token1Address, token2Address, commitment = "confirmed") {
        var _a;
        const accounts_1 = connection.getProgramAccounts(new web3_js_1.PublicKey(const_1.AMM_PROGRAM_ID), {
            commitment,
            filters: [
                { dataSize: raydium_sdk_1.LIQUIDITY_STATE_LAYOUT_V4.span },
                {
                    memcmp: {
                        offset: raydium_sdk_1.LIQUIDITY_STATE_LAYOUT_V4.offsetOf("baseMint"),
                        bytes: token1Address,
                    },
                },
                {
                    memcmp: {
                        offset: raydium_sdk_1.LIQUIDITY_STATE_LAYOUT_V4.offsetOf("quoteMint"),
                        bytes: token2Address,
                    },
                },
            ],
        });
        const accounts_2 = connection.getProgramAccounts(new web3_js_1.PublicKey(const_1.AMM_PROGRAM_ID), {
            commitment,
            filters: [
                { dataSize: raydium_sdk_1.LIQUIDITY_STATE_LAYOUT_V4.span },
                {
                    memcmp: {
                        offset: raydium_sdk_1.LIQUIDITY_STATE_LAYOUT_V4.offsetOf("baseMint"),
                        bytes: token2Address,
                    },
                },
                {
                    memcmp: {
                        offset: raydium_sdk_1.LIQUIDITY_STATE_LAYOUT_V4.offsetOf("quoteMint"),
                        bytes: token1Address,
                    },
                },
            ],
        });
        const accounts = (yield Promise.allSettled([accounts_1, accounts_2]))
            .map((response) => {
            if (response.status === "fulfilled") {
                return response.value;
            }
            return [];
        })
            .flat(1);
        const pools = [];
        for (const { pubkey, account } of accounts) {
            const data = raydium_sdk_1.LIQUIDITY_STATE_LAYOUT_V4.decode(account.data);
            const marketData = (_a = (yield connection.getParsedAccountInfo(data.marketId))
                .value) === null || _a === void 0 ? void 0 : _a.data;
            const decodedMarketData = raydium_sdk_1.MARKET_STATE_LAYOUT_V3.decode(marketData);
            const formattedData = {
                id: pubkey,
                baseMint: data.baseMint,
                quoteMint: data.quoteMint,
                lpMint: data.lpMint,
                baseDecimals: Number(data.baseDecimal.toString()),
                quoteDecimals: Number(data.quoteDecimal.toString()),
                lpDecimals: Number(data.baseDecimal.toString()),
                version: 4,
                programId: new web3_js_1.PublicKey(const_1.AMM_PROGRAM_ID),
                authority: new web3_js_1.PublicKey(const_1.AMM_AUTHORITY),
                openOrders: data.openOrders,
                targetOrders: data.targetOrders,
                baseVault: data.baseVault,
                quoteVault: data.quoteVault,
                withdrawQueue: data.withdrawQueue,
                lpVault: data.lpVault,
                marketVersion: 3,
                marketProgramId: data.marketProgramId,
                marketId: data.marketId,
                marketAuthority: raydium_sdk_1.Market.getAssociatedAuthority({
                    programId: data.marketProgramId,
                    marketId: data.marketId,
                }).publicKey,
                marketBaseVault: decodedMarketData.baseVault,
                marketQuoteVault: decodedMarketData.quoteVault,
                marketBids: decodedMarketData.bids,
                marketAsks: decodedMarketData.asks,
                marketEventQueue: decodedMarketData.eventQueue,
                lookupTableAccount: web3_js_1.PublicKey.default,
            };
            pools.push(formattedData);
        }
        return pools;
    });
}
exports.fetchPoolKeys = fetchPoolKeys;
