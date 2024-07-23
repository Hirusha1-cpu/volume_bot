import { Scenes } from "telegraf";
import { message } from "telegraf/filters";

import { ScenesEnum } from "../const";
import { setConfig } from "../db";
import { WalletBotContext } from "../Interfaces";

// max swap amount scene
export const maxSwapAmountScene = new Scenes.BaseScene<WalletBotContext>(
  ScenesEnum.SET_MAX_SWAP_AMOUNT_SCENE
);

maxSwapAmountScene.enter(async (ctx) => {
  ctx.reply("Please eneter the maximum amount of tokens you want to swap.");
});

maxSwapAmountScene.on(message("text"), async (ctx) => {
  const maxSwapAmount = Number(ctx.message.text);
  const userId = ctx?.from?.id as number;
  if (Number.isNaN(maxSwapAmount)) {
    await ctx.reply("Please enter a valid number.");
  } else {
    await setConfig({ maxSwapAmount }, userId);
    await ctx.reply(`Set maximum swap amount to ${maxSwapAmount}.`);
    ctx.scene.enter(ScenesEnum.CONFIG_SCENE);
  }
});
