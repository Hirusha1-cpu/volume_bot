"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodePublicKey = exports.encodePublicKey = exports.decodePrivateKey = exports.encodePrivateKey = exports.base58EncodedPrivateKeyToBase58EncodedPublicKey = exports.base58EncodedPrivateKeysToBase58EncodedPublicKeys = exports.generateKeyPairs = void 0;
const web3_js_1 = require("@solana/web3.js");
const bytes_1 = require("@project-serum/anchor/dist/cjs/utils/bytes");
function generateKeyPairs(numberOfWallets) {
    const base58EncodedPrivateKeys = [];
    const privateKeys = [];
    const publicKeys = [];
    const base58EncodedPublicKeys = [];
    try {
        for (let i = 0; i < numberOfWallets; i++) {
            const keypair = web3_js_1.Keypair.generate();
            const privateKey = bytes_1.bs58.encode(keypair.secretKey);
            privateKeys.push(keypair.secretKey);
            base58EncodedPrivateKeys.push(privateKey);
            publicKeys.push(keypair.publicKey);
            base58EncodedPublicKeys.push(keypair.publicKey.toBase58());
        }
        return {
            privateKeys,
            base58EncodedPrivateKeys,
            publicKeys,
            base58EncodedPublicKeys,
        };
    }
    catch (error) {
        throw Error(`Unexpected error. Wallet generation failed: ${error.message}`);
    }
}
exports.generateKeyPairs = generateKeyPairs;
function base58EncodedPrivateKeysToBase58EncodedPublicKeys(privateKeys) {
    const publicKeys = [];
    for (const privatekey of privateKeys) {
        const keypair = web3_js_1.Keypair.fromSecretKey(bytes_1.bs58.decode(privatekey));
        const publicKeyBase58 = keypair.publicKey.toBase58();
        publicKeys.push(publicKeyBase58);
    }
    return publicKeys;
}
exports.base58EncodedPrivateKeysToBase58EncodedPublicKeys = base58EncodedPrivateKeysToBase58EncodedPublicKeys;
function base58EncodedPrivateKeyToBase58EncodedPublicKey(privateKey) {
    return base58EncodedPrivateKeysToBase58EncodedPublicKeys([privateKey])[0];
}
exports.base58EncodedPrivateKeyToBase58EncodedPublicKey = base58EncodedPrivateKeyToBase58EncodedPublicKey;
function encodePrivateKey(privateKey) {
    return bytes_1.bs58.encode(privateKey);
}
exports.encodePrivateKey = encodePrivateKey;
function decodePrivateKey(privateKey) {
    return new Uint8Array(bytes_1.bs58.decode(privateKey));
}
exports.decodePrivateKey = decodePrivateKey;
function encodePublicKey(publicKey) {
    return publicKey.toBase58();
}
exports.encodePublicKey = encodePublicKey;
function decodePublicKey(publicKey) {
    return new web3_js_1.PublicKey(publicKey);
}
exports.decodePublicKey = decodePublicKey;
