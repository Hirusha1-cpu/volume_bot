import { Scenes,Markup } from "telegraf";
import { message } from "telegraf/filters";

import { ScenesEnum ,DefaultEnum} from "../const";
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
    await setConfig({ maintenanceBalance }, userId);
    await ctx.reply(`Set priority fee to ${maintenanceBalance}.`);
    ctx.scene.enter(ScenesEnum.CONFIG_SCENE);
  }
});

maintenaceBalanceScene.action(DefaultEnum.SET_DEFAULT, async (ctx) => {
  const userId = ctx?.from?.id as number;
  const defaultMinSwapAmount = 0.001;

  // Set the default minSwapAmount value
  await setConfig({ maintenanceBalance: defaultMinSwapAmount }, userId);
  await ctx.reply(`Set maintenance balance to the default value of ${defaultMinSwapAmount}.`);

  // Proceed to the next scene
  ctx.scene.enter(ScenesEnum.SET_MAINTENANCE_BALANCE_SCENE);
});

maintenaceBalanceScene.action(DefaultEnum.SET_VALUE, async (ctx) => {
  await ctx.reply("Set maintenance balance.");
});