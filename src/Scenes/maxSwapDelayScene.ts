import { Scenes,Markup } from "telegraf";
import { message } from "telegraf/filters";

import { ScenesEnum,DefaultEnum } from "../const";
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
    // await ctx.reply("Please enter a valid number.");
    const menuOptions = Markup.inlineKeyboard([
      [
        Markup.button.callback(
          DefaultEnum.SET_DEFAULT,
          DefaultEnum.SET_DEFAULT
        ),
      ],
      [
        Markup.button.callback(
          DefaultEnum.SET_VALUE,
          DefaultEnum.SET_VALUE
        ),
      ]
    ]);
  
    await ctx.reply("Please select an option", menuOptions);

  } else {
    await setConfig({ maxSwapDelay }, userId);
    await ctx.reply(`Set maximum delay between swaps to ${maxSwapDelay}.`);
    ctx.scene.enter(ScenesEnum.CONFIG_SCENE);
  }
});

maxSwapDelayScene.action(DefaultEnum.SET_DEFAULT, async (ctx) => {
  const userId = ctx?.from?.id as number;
  const defaultMinSwapAmount = 20;

  // Set the default minSwapAmount value
  await setConfig({ maxSwapDelay: defaultMinSwapAmount }, userId);
  await ctx.reply(`Set minimum swap amount to the default value of ${defaultMinSwapAmount}.`);

  // Proceed to the next scene
  ctx.scene.enter(ScenesEnum.SET_MAX_DELAY_SCENE);
});

maxSwapDelayScene.action(DefaultEnum.SET_VALUE, async (ctx) => {
  await ctx.reply("Set max swap delay.");
});