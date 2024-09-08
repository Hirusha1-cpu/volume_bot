import { Scenes, Markup } from "telegraf";
import { message } from "telegraf/filters";
import { ScenesEnum, DefaultEnum } from "../const";
import { setConfig } from "../db";
import { WalletBotContext } from "../Interfaces";

// min swap delay scene
export const rpcUrlScene = new Scenes.BaseScene<WalletBotContext>(
  ScenesEnum.SET_RPC_URL_SCENE
);

rpcUrlScene.enter(async (ctx) => {
  ctx.reply("🔗 Set the RPC Url");
});

rpcUrlScene.on(message("text"), async (ctx) => {
  if (ctx.message && typeof ctx.message.text === 'string') {
    const rpcUrl = ctx.message.text;
    const userId = ctx?.from?.id as number;

    if (!rpcUrl) {
      const menuOptions = Markup.inlineKeyboard([
        [Markup.button.callback(DefaultEnum.SET_DEFAULT, DefaultEnum.SET_DEFAULT)],
        [Markup.button.callback(DefaultEnum.SET_VALUE, DefaultEnum.SET_VALUE)],
      ]);
      await ctx.reply("Please select an option", menuOptions);
      ctx.scene.enter(ScenesEnum.CONFIG_SCENE);
    } else {
      await setConfig({ rpcUrl }, userId);
      await ctx.reply(`🔗 Setted RPC Url to \n\n ➡️ ${rpcUrl}.`);
      ctx.scene.enter(ScenesEnum.CONFIG_SCENE);
    }
  }
});

rpcUrlScene.action(DefaultEnum.SET_DEFAULT, async (ctx) => {
  const userId = ctx?.from?.id as number;
  const rpcUrl = process.env.RPC_URL;

  // Set the default minSwapDelay value
  await setConfig({ rpcUrl:rpcUrl }, userId);
  await ctx.reply(`Set rpc URL to the default value of ${rpcUrl}.`);

  // Proceed to the next scene
  ctx.scene.enter(ScenesEnum.SET_MIN_DELAY_SCENE);
});

rpcUrlScene.action(DefaultEnum.SET_VALUE, async (ctx) => {
  await ctx.reply("Set rpc URL to the default value");
});