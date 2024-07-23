import { Scenes } from "telegraf";
import { message } from "telegraf/filters";

import { ScenesEnum } from "../const";
import { setConfig } from "../db";
import { WalletBotContext } from "../Interfaces";

// max swap delay scene
export const maxSwapDelayScene = new Scenes.BaseScene<WalletBotContext>(
  ScenesEnum.SET_MAX_DELAY_SCENE
);

maxSwapDelayScene.enter(async (ctx) => {
  ctx.reply("Set maximum seconds of delay between swaps.");
});

maxSwapDelayScene.on(message("text"), async (ctx) => {
  const maxSwapDelay = Number(ctx.message.text);
  const userId = ctx?.from?.id as number;
  if (Number.isNaN(maxSwapDelay)) {
    await ctx.reply("Please enter a valid number.");
  } else {
    await setConfig({ maxSwapDelay }, userId);
    await ctx.reply(`Set maximum delay between swaps to ${maxSwapDelay}.`);
    ctx.scene.enter(ScenesEnum.CONFIG_SCENE);
  }
});
