import { Scenes } from "telegraf";

import { ScenesEnum } from "../const";
import { getExpiry } from "../db";
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
    ctx.scene.enter(ScenesEnum.GENERATE_MAIN_WALLET_SCENE);
  }
});
