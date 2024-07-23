import { PublicKey } from "@solana/web3.js";
export declare function generateKeyPairs(numberOfWallets: number): {
    privateKeys: Uint8Array[];
    base58EncodedPrivateKeys: string[];
    publicKeys: PublicKey[];
    base58EncodedPublicKeys: string[];
};
export declare function base58EncodedPrivateKeysToBase58EncodedPublicKeys(privateKeys: string[]): string[];
export declare function base58EncodedPrivateKeyToBase58EncodedPublicKey(privateKey: string): string;
export declare function encodePrivateKey(privateKey: Uint8Array): string;
export declare function decodePrivateKey(privateKey: string): Uint8Array;
export declare function encodePublicKey(publicKey: PublicKey): string;
export declare function decodePublicKey(publicKey: string): PublicKey;
//# sourceMappingURL=accounts.d.ts.map