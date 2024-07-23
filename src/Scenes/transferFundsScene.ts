import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Scenes } from "telegraf";
import { message } from "telegraf/filters";

import { ScenesEnum, connection } from "../const";
import { getConfig, getMainPrivateKey } from "../db";
import { WalletBotContext } from "../Interfaces";
import { transferSOL } from "../lib";

// transfer funds scene
export const transferFundsScene = new Scenes.BaseScene<WalletBotContext>(
  ScenesEnum.TRANSFER_FUNDS_SCENE
);

transferFundsScene.enter(async (ctx) => {
  ctx.reply("How much SOL do you want to transfer to each account?");
});

transferFundsScene.on(message("text"), async (ctx) => {
  const amountToTransfer = Number(ctx.message.text);
  if (Number.isNaN(amountToTransfer)) {
    await ctx.reply("Please enter a valid number.");
  } else {
    const userId = ctx?.from?.id as number;
    const mainPrivateKey = await getMainPrivateKey(userId);
    const {
      subWallets: { base58EncodedPublicKeys },
      priorityFee,
    } = await getConfig(userId);
    for (const publicKey of base58EncodedPublicKeys) {
      try {
        const txHash = await transferSOL(
          connection,
          amountToTransfer,
          mainPrivateKey,
          publicKey,
          priorityFee * LAMPORTS_PER_SOL
        );

        await ctx.reply(`https://solscan.io/tx/${txHash}`);
      } catch (error: any) {
        await ctx.reply(`Transfer failed ${error.message}`);
      }
    }

    ctx.scene.enter(ScenesEnum.MAIN_SCENE);
  }
});
