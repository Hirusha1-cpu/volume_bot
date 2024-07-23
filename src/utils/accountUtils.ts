import { Keypair } from "@solana/web3.js";
import { generateMnemonic, mnemonicToSeed } from "bip39";
import { derivePath } from "ed25519-hd-key";

// Function to generate a mnemonic phrase
export function getRandomMnemonic(): string {
  const mnemonic = generateMnemonic(256); // 24 words
  return mnemonic;
}

// Function to get the master secret key from the mnemonic
export async function getMasterSecretKeyFromMnemonic(
  mnemonic: string
): Promise<Buffer> {
  const seed = await mnemonicToSeed(mnemonic);
  return Buffer.from(seed);
}

// Function to get a child keypair from the master key using a derivation path
export function getChildKeypair(seed: Buffer, path: string): Keypair {
  const { key } = derivePath(path, seed.toString("hex"));
  return Keypair.fromSeed(Uint8Array.from(key));
}
