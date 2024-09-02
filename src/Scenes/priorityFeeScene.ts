import { Scenes,Markup } from "telegraf";
import { message } from "telegraf/filters";

import { ScenesEnum,DefaultEnum } from "../const";
import { setConfig } from "../db";
import { WalletBotContext } from "../Interfaces";

// config scene
export const priorityFeeScene = new Scenes.BaseScene<WalletBotContext>(
  ScenesEnum.SET_PRIORITY_FEE_SCENE
);

priorityFeeScene.enter(async (ctx) => {
  ctx.reply("Please enter priority fee (ex. 0.001)");

});

priorityFeeScene.on(message("text"), async (ctx) => {
  const priorityFee = Number(ctx.message.text);
  const userId = ctx?.from?.id as number;
  if (Number.isNaN(priorityFee)) {
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
    await setConfig({ priorityFee }, userId);
    await ctx.reply(`Set priority fee to ${priorityFee}.`);
    ctx.scene.enter(ScenesEnum.CONFIG_SCENE);
  }
});
