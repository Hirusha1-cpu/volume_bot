import { Scenes, Markup } from "telegraf";
import { message } from "telegraf/filters";

import { ScenesEnum, DefaultEnum } from "../const";
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
    ctx.scene.enter(ScenesEnum.CONFIG_SCENE);

    
  } else {
    await setConfig({ maxSwapAmount }, userId);
    await ctx.reply(`Set maximum swap amount to ${maxSwapAmount}.`);
    ctx.scene.enter(ScenesEnum.CONFIG_SCENE);
  }
});

maxSwapAmountScene.action(DefaultEnum.SET_DEFAULT, async (ctx) => {
  const userId = ctx?.from?.id as number;
  const defaultMinSwapAmount = 0.005;

  // Set the default minSwapAmount value
  await setConfig({ maxSwapAmount: defaultMinSwapAmount }, userId);
  await ctx.reply(`Set minimum swap amount to the default value of ${defaultMinSwapAmount}.`);

  // Proceed to the next scene
  ctx.scene.enter(ScenesEnum.SET_MAX_SWAP_AMOUNT_SCENE);
});

maxSwapAmountScene.action(DefaultEnum.SET_VALUE, async (ctx) => {
  await ctx.reply("Set maximum swap amount.");
});