import { Scenes } from "telegraf";
import { message } from "telegraf/filters";

import { ScenesEnum } from "../const";
import { setConfig } from "../db";
import { WalletBotContext } from "../Interfaces";

// min swap delay scene
export const minSwapDelayScene = new Scenes.BaseScene<WalletBotContext>(
  ScenesEnum.SET_MIN_DELAY_SCENE
);

minSwapDelayScene.enter(async (ctx) => {
  ctx.reply("Set mimimum seconds of delay between swaps.");
});

minSwapDelayScene.on(message("text"), async (ctx) => {
  const minSwapDelay = Number(ctx.message.text);
  const userId = ctx?.from?.id as number;
  if (Number.isNaN(minSwapDelay)) {
    await ctx.reply("Please enter a valid number.");
  } else {
    await setConfig({ minSwapDelay }, userId);

    await ctx.reply(`Set minimum delay between swaps to ${minSwapDelay}.`);
    ctx.scene.enter(ScenesEnum.SET_MAX_DELAY_SCENE);
  }
});
