import { Scenes } from "telegraf";
import { message } from "telegraf/filters";

import { ScenesEnum } from "../const";
import { setConfig, getConfig } from "../db";
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
  const defaultValues = {
    minSwapAmount: 0.00001,
    maxSwapAmount: 0.00005,
    minSwapDelay: 10,
    maxSwapDelay: 20,
    priorityFee: 0.001,
    maintenanceBalance: 0.001,
  };
  const numberOfWallets = Number(ctx.message.text);
  if (Number.isNaN(numberOfWallets)) {
    await ctx.reply("Please enter a valid number.");
  } else {
    const userId = ctx?.from?.id as number;
    const { base58EncodedPrivateKeys, base58EncodedPublicKeys } =
      generateKeyPairs(numberOfWallets);
    const { minSwapAmount } = await getConfig(userId);
    if (minSwapAmount != null || minSwapAmount == undefined) {
      // Send a message with the default values
      await ctx.reply(
        `Please enter the number of wallets you want to generate.\n\n` +
          `Default values have been set:\n` +
          `🔹 Min Swap Amount: ${defaultValues.minSwapAmount} SOL\n` +
          `🔹 Max Swap Amount: ${defaultValues.maxSwapAmount} SOL\n` +
          `🔹 Min Swap Delay: ${defaultValues.minSwapDelay} seconds\n` +
          `🔹 Max Swap Delay: ${defaultValues.maxSwapDelay} seconds\n` +
          `🔹 Priority Fee: ${defaultValues.priorityFee} SOL\n` +
          `🔹 Maintenance Balance: ${defaultValues.maintenanceBalance} SOL`
      );
    }
    await setConfig(
      { subWallets: { base58EncodedPrivateKeys, base58EncodedPublicKeys } },
      userId
    );
    await ctx.reply(`👜 ${numberOfWallets} sub wallets created.`);
    for (let i = 0; i < numberOfWallets; i++) {
      await ctx.replyWithHTML(
        `👜 <b>Wallet 1</b>\n\n` +
        `📫 <b>Address:</b> <code>${base58EncodedPublicKeys[i]}</code>\n\n` +
        `🔑 <b>Private Key:</b> <code>${base58EncodedPrivateKeys[i]}</code>`
      );
      
    }
    ctx.scene.enter(ScenesEnum.MAIN_SCENE);
  }
});
