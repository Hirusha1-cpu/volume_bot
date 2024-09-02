import { Scenes, Markup } from "telegraf";
import { message } from "telegraf/filters";
import { ScenesEnum, DefaultEnum } from "../const";
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
  if (ctx.message && typeof ctx.message.text === 'string') {
    const minSwapDelay = Number(ctx.message.text);
    const userId = ctx?.from?.id as number;

    if (Number.isNaN(minSwapDelay)) {
      const menuOptions = Markup.inlineKeyboard([
        [Markup.button.callback(DefaultEnum.SET_DEFAULT, DefaultEnum.SET_DEFAULT)],
        [Markup.button.callback(DefaultEnum.SET_VALUE, DefaultEnum.SET_VALUE)],
      ]);
      await ctx.reply("Please select an option", menuOptions);
      ctx.scene.enter(ScenesEnum.SET_MAX_DELAY_SCENE);
    } else {
      await setConfig({ minSwapDelay }, userId);
      await ctx.reply(`Set minimum delay between swaps to ${minSwapDelay}.`);
      ctx.scene.enter(ScenesEnum.SET_MAX_DELAY_SCENE);
    }
  }
});

minSwapDelayScene.action(DefaultEnum.SET_DEFAULT, async (ctx) => {
  const userId = ctx?.from?.id as number;
  const defaultMinSwapDelay = 10;

  // Set the default minSwapDelay value
  await setConfig({ minSwapDelay: defaultMinSwapDelay }, userId);
  await ctx.reply(`Set minimum swap amount to the default value of ${defaultMinSwapDelay}.`);

  // Proceed to the next scene
  ctx.scene.enter(ScenesEnum.SET_MIN_DELAY_SCENE);
});

minSwapDelayScene.action(DefaultEnum.SET_VALUE, async (ctx) => {
  await ctx.reply("Set mimimum seconds of delay between swaps.");
});