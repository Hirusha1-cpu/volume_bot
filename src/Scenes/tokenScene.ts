import { Scenes } from "telegraf";
import { message } from "telegraf/filters";

import { ConfigFunctionsEnum, ScenesEnum } from "../const";
import { setConfig } from "../db";
import { WalletBotContext } from "../Interfaces";

// config scene
export const tokenScene = new Scenes.BaseScene<WalletBotContext>(
  ScenesEnum.SET_TOKEN_SCENE
);

tokenScene.enter(async (ctx) => {
  ctx.reply(
    "Please enter your token address. (Make sure this is a token address and there is an AMM pool for token/SOL in Raydium.)"
  );
});

tokenScene.on(message("text"), async (ctx) => {
  const token = ctx.message.text;
  const userId = ctx?.from?.id as number;
  await setConfig({ token }, userId);
  await ctx.reply(`Set token to ${token}.`);
  ctx.scene.enter(ScenesEnum.CONFIG_SCENE);
});
