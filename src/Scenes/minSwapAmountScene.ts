import { Scenes } from "telegraf";
import { message } from "telegraf/filters";

import { ScenesEnum } from "../const";
import { setConfig } from "../db";
import { WalletBotContext } from "../Interfaces";

// min swap amount scene
export const minSwapAmountScene = new Scenes.BaseScene<WalletBotContext>(
  ScenesEnum.SET_MIN_SWAP_AMOUNT_SCENE
);

minSwapAmountScene.enter(async (ctx) => {
  ctx.reply("Please eneter the minimum amount of tokens you want to swap.");
});

minSwapAmountScene.on(message("text"), async (ctx) => {
  const minSwapAmount = Number(ctx.message.text);
  const userId = ctx?.from?.id as number;
  if (Number.isNaN(minSwapAmount)) {
    await ctx.reply("Please enter a valid number.");
  } else {
    await setConfig({ minSwapAmount }, userId);
    await ctx.reply(`Set minimum swap amount to ${minSwapAmount}.`);
    ctx.scene.enter(ScenesEnum.SET_MAX_SWAP_AMOUNT_SCENE);
  }
});
