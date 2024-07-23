import { Scenes } from "telegraf";
import { message } from "telegraf/filters";

import { ScenesEnum } from "../const";
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
    await ctx.reply("Please enter a valid number.");
  } else {
    await setConfig({ priorityFee }, userId);
    await ctx.reply(`Set priority fee to ${priorityFee}.`);
    ctx.scene.enter(ScenesEnum.CONFIG_SCENE);
  }
});
