import { Scenes } from "telegraf";

import { ScenesEnum } from "../const";
import { getExpiry, getConfig } from "../db";
import { WalletBotContext } from "../Interfaces";

// Start scene
export const authScene = new Scenes.BaseScene<WalletBotContext>(
  ScenesEnum.AUTH_SCENE
);
// authScene.enter(async (ctx) => {
//   const userId = ctx?.from?.id as number;
//   // if (await getExpiry(userId)) {
//   //   ctx.reply("Expired");
//   // } else {
//     ctx.scene.enter(ScenesEnum.GENERATE_MAIN_WALLET_SCENE);
//   // }
// });

authScene.enter(async (ctx) => {
  ctx.reply("👋 Welcome to the Solana Telegram Bot!");
  const userId = ctx?.from?.id as number;
  const config = await getConfig(userId);
  if (!config || !config.token ) {
    ctx.scene.enter(ScenesEnum.SET_TOKEN_SCENE);
  }
  else{
    ctx.scene.enter(ScenesEnum.GENERATE_MAIN_WALLET_SCENE);
  }
});

// authScene.enter(async (ctx) => {
//   const userId = ctx?.from?.id as number;
//   const config = await getConfig(userId);

//     ctx.scene.enter(ScenesEnum.GENERATE_MAIN_WALLET_SCENE);

// });