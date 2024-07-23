import { Markup, Scenes } from "telegraf";
import { message } from "telegraf/filters";

import { CommandEnum, CommonEnum, ScenesEnum } from "../const";
import { getExpiry, setTCStatus } from "../db";
import { WalletBotContext } from "../Interfaces";

// Start scene
export const authScene = new Scenes.BaseScene<WalletBotContext>(
  ScenesEnum.AUTH_SCENE
);
authScene.enter(async (ctx) => {
  const userId = ctx?.from?.id as number;
  if (await getExpiry(userId)) {
    ctx.reply("Expired");
  } else {
    ctx.scene.enter(ScenesEnum.TERMS_AND_CONDITIONS_SCENE);
  }
});

// authScene.on(message("text"), (ctx) =>
//   // query website db

//   // check validity of token
//   // if token correct move foward

//   // ctx.scene.enter(ScenesEnum.TERMS_AND_CONDITIONS_SCENE)

// );
