import { message } from "telegraf/filters";
import { Markup, Scenes } from "telegraf";
import { ScenesEnum, CommonEnum, ContactUsEnum } from "../const";
import { setConfig, getTokenAddressOfUser, getConfig } from "../db";
import { WalletBotContext } from "../Interfaces";

// config scene
export const tokenScene = new Scenes.BaseScene<WalletBotContext>(
  ScenesEnum.SET_TOKEN_SCENE
);

export const configScene = new Scenes.BaseScene<WalletBotContext>(
  ScenesEnum.CONFIG_SCENE
);

tokenScene.start((ctx) => {
  ctx.scene.enter(ScenesEnum.MAIN_SCENE);
});

tokenScene.enter(async (ctx) => {
  ctx.reply(
    "Please enter your token address. (Make sure this is a token address and there is an AMM pool for token/SOL in Raydium.)"
  );
});
tokenScene.on(message("text"), async (ctx) => {
  const token = ctx.message.text;
  const userId = ctx?.from?.id as number;
  console.log(token);

  try {
    const existingToken = await getTokenAddressOfUser(token);

    if (existingToken !== null) {
      await ctx.reply("This token has already been registered.");
      // await setConfig({ token }, userId);
      // await ctx.reply(`Set token to ${token}.`);
      // ctx.scene.enter(ScenesEnum.CONFIG_SCENE);

      await setConfig({ token }, userId);
      await ctx.reply(`Token address set to ${token}.`);
      const config = await getConfig(userId);
      if (config.minSwapAmount != null) {
        
        ctx.scene.enter(ScenesEnum.GENERATE_MAIN_WALLET_SCENE);
      }else{
        ctx.scene.enter(ScenesEnum.CONFIG_SCENE);
      }
      
    } else {
      await ctx.reply("This token has not been registered. Please contact us.");

      const menuOptions = Markup.inlineKeyboard([
        [
          Markup.button.callback(
            ContactUsEnum.SET_TOKEN,
            ContactUsEnum.SET_TOKEN
          ),
        ],
        [
          Markup.button.callback(
            ContactUsEnum.SET_CONTACT_US,
            ContactUsEnum.SET_CONTACT_US
          ),
        ],

        [Markup.button.callback(CommonEnum.BACK, CommonEnum.BACK)],
      ]);

      await ctx.reply("Please select an option", menuOptions);
      ctx.scene.enter(ScenesEnum.CONFIG_SCENE);

      // await setConfig({ token }, userId);
      // await ctx.reply(`Set token to ${token}.`);
      // ctx.scene.enter(ScenesEnum.CONFIG_SCENE);
    }
  } catch (error) {
    console.error("Error in token scene:", error);
    await ctx.reply("An error occurred while processing your request.");
  }
});

// tokenScene.on(message("text"), async (ctx) => {
//   const token = ctx.message.text;
//   const userId = ctx?.from?.id as number;

//   await setConfig({ token }, userId);
//     await ctx.reply(`Set token to ${token}.`);
//     ctx.scene.enter(ScenesEnum.CONFIG_SCENE);

// });
