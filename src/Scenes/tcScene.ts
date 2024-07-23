import { Markup, Scenes } from "telegraf";
import { message } from "telegraf/filters";

import { CommandEnum, CommonEnum, ScenesEnum } from "../const";
import { setTCStatus } from "../db";
import { WalletBotContext } from "../Interfaces";

// Start scene
export const termsAndConditionsScene = new Scenes.BaseScene<WalletBotContext>(
  ScenesEnum.TERMS_AND_CONDITIONS_SCENE
);
termsAndConditionsScene.enter(async (ctx) => {
  const menuOptions = Markup.inlineKeyboard([
    [Markup.button.callback(CommonEnum.ACCEPT, CommonEnum.ACCEPT)],
    [Markup.button.callback(CommonEnum.DECLINE, CommonEnum.DECLINE)],
  ]);
  ctx.reply(`Please acccept terms and conditions to continue.`, menuOptions);
});
termsAndConditionsScene.action(CommonEnum.ACCEPT, async (ctx) => {
  const userId = ctx?.from?.id as number;
  await ctx.editMessageReplyMarkup(undefined);

  await setTCStatus(true, userId);
  await ctx.reply("Accepted terms and conditions.");
  ctx.scene.enter(ScenesEnum.PRIVACY_POLICY_SCENE);
});
termsAndConditionsScene.action(CommonEnum.DECLINE, async (ctx) => {
  const userId = ctx?.from?.id as number;
  await setTCStatus(false, userId);
  await ctx.reply(
    `You chose ${CommonEnum.DECLINE}. Cannot continue untill you accept terms and conditions.`
  );
});
termsAndConditionsScene.on(message("text"), (ctx) =>
  ctx.reply(
    `Please use /${CommandEnum.CREATE} command and follow the instructions to create real estate listing images.`
  )
);
