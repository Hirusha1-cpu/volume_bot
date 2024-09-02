import { Scenes , Markup} from "telegraf";
import { message } from "telegraf/filters";

import { ScenesEnum,DefaultEnum } from "../const";
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
  if (Number.isNaN(minSwapAmount) || minSwapAmount == null) {
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
    // ctx.scene.enter(ScenesEnum.SET_MAX_SWAP_AMOUNT_SCENE);


  } else {
    await setConfig({ minSwapAmount }, userId);
    await ctx.reply(`Set minimum swap amount to ${minSwapAmount}.`);
    ctx.scene.enter(ScenesEnum.SET_MIN_SWAP_AMOUNT_SCENE);
  }
});

minSwapAmountScene.action(DefaultEnum.SET_DEFAULT, async (ctx) => {
  const userId = ctx?.from?.id as number;
  const defaultMinSwapAmount = 0.001;

  // Set the default minSwapAmount value
  await setConfig({ minSwapAmount: defaultMinSwapAmount }, userId);
  await ctx.reply(`Set minimum swap amount to the default value of ${defaultMinSwapAmount}.`);

  // Proceed to the next scene
  ctx.scene.enter(ScenesEnum.SET_MIN_SWAP_AMOUNT_SCENE);
});

minSwapAmountScene.action(DefaultEnum.SET_VALUE, async (ctx) => {
  await ctx.reply("Set mimimum swap amount.");

});
