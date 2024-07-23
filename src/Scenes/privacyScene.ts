import { Markup, Scenes } from "telegraf";
import { message } from "telegraf/filters";

import { CommonEnum, ScenesEnum } from "../const";
import { setPPStatus } from "../db";
import { WalletBotContext } from "../Interfaces";

// Image scene
export const privacyPolicyScene = new Scenes.BaseScene<WalletBotContext>(
  ScenesEnum.PRIVACY_POLICY_SCENE
);
privacyPolicyScene.enter(async (ctx) => {
  const menuOptions = Markup.inlineKeyboard([
    [Markup.button.callback(CommonEnum.ACCEPT, CommonEnum.ACCEPT)],
    [Markup.button.callback(CommonEnum.DECLINE, CommonEnum.DECLINE)],
  ]);
  ctx.reply("Please accept the privacy policy to continue.", menuOptions);
});
privacyPolicyScene.action(CommonEnum.ACCEPT, async (ctx) => {
  const userId = ctx?.from?.id as number;
  await setPPStatus(true, userId);
  await ctx.editMessageReplyMarkup(undefined);

  await ctx.reply("Accepted the privacy policy.");
  ctx.scene.enter(ScenesEnum.GENERATE_MAIN_WALLET_SCENE);
});
privacyPolicyScene.action(CommonEnum.DECLINE, async (ctx) => {
  const userId = ctx?.from?.id as number;
  await setPPStatus(false, userId);
  await ctx.reply(
    `You chose ${CommonEnum.DECLINE}. Cannot continue untill you accept the privacy policy.`
  );
});
privacyPolicyScene.start((ctx) => {
  ctx.scene.enter(ScenesEnum.TERMS_AND_CONDITIONS_SCENE);
});

privacyPolicyScene.on(message("text"), (ctx) =>
  ctx.reply("Please upload an image only.")
);
