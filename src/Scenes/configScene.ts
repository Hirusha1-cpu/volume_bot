import { Markup, Scenes } from "telegraf";
import { WalletBotContext } from "../Interfaces";
import { CommonEnum, ConfigFunctionsEnum, ScenesEnum } from "../const";

// config scene
export const configScene = new Scenes.BaseScene<WalletBotContext>(
  ScenesEnum.CONFIG_SCENE
);

configScene.enter(async (ctx) => {
  const menuOptions = Markup.inlineKeyboard([
    [
      Markup.button.callback(
        ConfigFunctionsEnum.SET_TOKEN,
        ConfigFunctionsEnum.SET_TOKEN
      ),
    ],
    [
      Markup.button.callback(
        ConfigFunctionsEnum.SET_RPC_URL,
        ConfigFunctionsEnum.SET_RPC_URL
      ),
    ],
    [
      Markup.button.callback(
        ConfigFunctionsEnum.SET_SWAP_AMOUNT,
        ConfigFunctionsEnum.SET_SWAP_AMOUNT
      ),
    ],
    [
      Markup.button.callback(
        ConfigFunctionsEnum.SET_DELAY,
        ConfigFunctionsEnum.SET_DELAY
      ),
      Markup.button.callback(
        ConfigFunctionsEnum.SET_PRIORITY_FEE,
        ConfigFunctionsEnum.SET_PRIORITY_FEE
      ),
    ],
    [
      Markup.button.callback(
        ConfigFunctionsEnum.SET_MIN_MAINTENANCE_BALANCE,
        ConfigFunctionsEnum.SET_MIN_MAINTENANCE_BALANCE
      ),
    ],
    [Markup.button.callback(CommonEnum.BACK, CommonEnum.BACK)],
  ]);
  ctx.reply("Please select an option", menuOptions);
});

configScene.action(ConfigFunctionsEnum.SET_TOKEN, async (ctx) => {
  ctx.scene.enter(ScenesEnum.SET_TOKEN_SCENE);
});

configScene.action(ConfigFunctionsEnum.SET_SWAP_AMOUNT, async (ctx) => {
  ctx.scene.enter(ScenesEnum.SET_MIN_SWAP_AMOUNT_SCENE);
});

configScene.action(ConfigFunctionsEnum.SET_DELAY, async (ctx) => {
  ctx.scene.enter(ScenesEnum.SET_MIN_DELAY_SCENE);
});

configScene.action(ConfigFunctionsEnum.SET_PRIORITY_FEE, async (ctx) => {
  ctx.scene.enter(ScenesEnum.SET_PRIORITY_FEE_SCENE);
});

configScene.action(
  ConfigFunctionsEnum.SET_MIN_MAINTENANCE_BALANCE,
  async (ctx) => {
    ctx.scene.enter(ScenesEnum.SET_MAINTENANCE_BALANCE_SCENE);
  }
);
configScene.action(
  ConfigFunctionsEnum.SET_RPC_URL,
  async (ctx) => {
    ctx.scene.enter(ScenesEnum.SET_RPC_URL_SCENE);

  }
);



configScene.action(CommonEnum.BACK, async (ctx) => {
  ctx.scene.enter(ScenesEnum.MAIN_SCENE);
});
