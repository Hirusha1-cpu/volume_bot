import { Scenes, Telegraf, session } from "telegraf";

import { BOT_TOKEN, ScenesEnum, logger } from "./const";
import { WalletBotContext } from "./Interfaces";
import { authScene } from "./Scenes/auth";
import { configScene } from "./Scenes/configScene";
import { generateSubWalletsScene } from "./Scenes/generateSubWalletsscene";
import { generateMainWalletScene } from "./Scenes/generateWalletScene";
import { mainScene } from "./Scenes/mainScene";
import { maintenaceBalanceScene } from "./Scenes/mainteneceBalanceScene";
import { maxSwapAmountScene } from "./Scenes/maxSwapAmountScene";
import { maxSwapDelayScene } from "./Scenes/maxSwapDelayScene";
import { minSwapAmountScene } from "./Scenes/minSwapAmountScene";
import { minSwapDelayScene } from "./Scenes/minSwapDelayScene";
import { priorityFeeScene } from "./Scenes/priorityFeeScene";
import { tokenScene } from "./Scenes/tokenScene";
import { transferFundsScene } from "./Scenes/transferFundsScene";
import { volumeGenerationScene } from "./Scenes/volumeGenerationScene";
import {helpScene} from "./Scenes/helpScene"; // Import your scenes
import { rpcUrlScene } from "./Scenes/rpcUrlScene";
import { getConfig } from "./db";


const bot = new Telegraf<WalletBotContext>(BOT_TOKEN);

const stage = new Scenes.Stage<WalletBotContext>([
  generateMainWalletScene,
  mainScene,
  configScene,
  tokenScene,
  minSwapAmountScene,
  maxSwapAmountScene,
  minSwapDelayScene,
  maxSwapDelayScene,
  priorityFeeScene,
  maintenaceBalanceScene,
  generateSubWalletsScene,
  transferFundsScene,
  volumeGenerationScene,
  authScene,
  helpScene,
  rpcUrlScene
]);

bot.use(session());
bot.use(stage.middleware());

// Middleware to track usage count
bot.use(async (ctx, next) => {
  const userId = ctx?.from?.id;

  await next();
});

bot
  .start(async (ctx) => {
    // ctx.reply("👋 Welcome to the Solana Telegram Bot!");
    // const userId = ctx?.from?.id as number;
    // const config = await getConfig(userId);
    // await ctx.scene.enter(ScenesEnum.MAIN_SCENE);
    // setTimeout(() => {
      ctx.scene.enter(ScenesEnum.AUTH_SCENE);
    // }, 100); // 100ms delay, adjust as needed
  })
  .catch((err) => logger.error(err as string));

bot.launch().catch((err) => logger.error(err));

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
