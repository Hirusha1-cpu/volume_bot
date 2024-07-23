import { Scenes } from "telegraf";
import { message } from "telegraf/filters";

import { ScenesEnum } from "../const";
import { setConfig } from "../db";
import { WalletBotContext } from "../Interfaces";

// config scene
export const maintenaceBalanceScene = new Scenes.BaseScene<WalletBotContext>(
  ScenesEnum.SET_MAINTENANCE_BALANCE_SCENE
);

maintenaceBalanceScene.enter(async (ctx) => {
  ctx.reply(
    "Please enter maintenance balance (Sol amount to pay fees. Default 0.001)"
  );
});

maintenaceBalanceScene.on(message("text"), async (ctx) => {
  const maintenanceBalance = Number(ctx.message.text);
  const userId = ctx?.from?.id as number;
  if (Number.isNaN(maintenanceBalance)) {
    await ctx.reply("Please enter a valid number.");
  } else {
    await setConfig({ maintenanceBalance }, userId);
    await ctx.reply(`Set priority fee to ${maintenanceBalance}.`);
    ctx.scene.enter(ScenesEnum.CONFIG_SCENE);
  }
});
