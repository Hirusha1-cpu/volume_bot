import { Scenes } from "telegraf";
import { WalletBotContext } from "../Interfaces";
import { ScenesEnum } from "../const";
import { message } from "telegraf/filters";
import { setConfig } from "../db";
import { generateKeyPairs } from "../lib/accounts";

// sub wallet scene
export const generateSubWalletsScene = new Scenes.BaseScene<WalletBotContext>(
  ScenesEnum.SUB_WALLET_GENERSTION_SCENE
);

generateSubWalletsScene.enter(async (ctx) => {
  ctx.reply("Please enter the number of wallets you wan to generate.");
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
    ctx.scene.enter(ScenesEnum.MAIN_SCENE);
  }
});
