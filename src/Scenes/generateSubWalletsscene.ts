import { Scenes } from "telegraf";
import { message } from "telegraf/filters";

import { ScenesEnum } from "../const";
import { setConfig } from "../db";
import { WalletBotContext } from "../Interfaces";
import { generateKeyPairs } from "../lib/accounts";

// sub wallet scene
export const generateSubWalletsScene = new Scenes.BaseScene<WalletBotContext>(
  ScenesEnum.SUB_WALLET_GENERSTION_SCENE
);

generateSubWalletsScene.enter(async (ctx) => {
  ctx.reply("Please enter the number of wallets you want to generate.");
});

generateSubWalletsScene.on(message("text"), async (ctx) => {
  const numberOfWallets = Number(ctx.message.text);
  if (Number.isNaN(numberOfWallets)) {
    await ctx.reply("Please enter a valid number.");
  } else {
    const userId = ctx?.from?.id as number;
    const { base58EncodedPrivateKeys, base58EncodedPublicKeys } =
      generateKeyPairs(numberOfWallets);
    await setConfig(
      { subWallets: { base58EncodedPrivateKeys, base58EncodedPublicKeys } },
      userId
    );
    await ctx.reply(`${numberOfWallets} sub wallets created.`);
    for (let i = 0; i < numberOfWallets; i++) {
      await ctx.reply(
        `Wallet 1: Address: ${base58EncodedPublicKeys[i]} Private key: ${base58EncodedPrivateKeys[i]}`
      );
    }
    ctx.scene.enter(ScenesEnum.MAIN_SCENE);
  }
});
