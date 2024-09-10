import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Scenes } from "telegraf";
import { ScenesEnum, connection, MainFunctionsEnum } from "../const";
import { getConfig, getMainPrivateKey, setExpiry } from "../db";
import { WalletBotContext } from "../Interfaces";
import { Markup } from 'telegraf';
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';
import {
  SOL_ADDRESS,
  fetchPoolKeys,
  getRandomFloat,
  getTokenBalance,
  swap,
  waitSeconds,
} from "../lib";
import { DEFAULT_WAIT_SECONDS } from "../lib";
import { base58EncodedPrivateKeyToBase58EncodedPublicKey } from "../lib/accounts";

let isStopped = false;
let volumeGenerationInterval: NodeJS.Timeout;

// volume generation scene
export const volumeGenerationScene = new Scenes.BaseScene<WalletBotContext>(
  ScenesEnum.VOLUME_GENERATION_PROGRESS
);

volumeGenerationScene.enter(async (ctx) => {
  const stopButton: InlineKeyboardButton.CallbackButton = Markup.button.callback('🛑 Stop Generation', 'stop_generation');
  const keyboard = Markup.inlineKeyboard([stopButton]);

  ctx.reply("Volume generation starting... Click the button below to stop the process.", keyboard);

  const noOfIterations = 1000;
  const userId = ctx?.from?.id as number;
  const mainPrivateKey = await getMainPrivateKey(userId);
  const {
    token,
    minSwapAmount,
    maxSwapAmount,
    minSwapDelay,
    maxSwapDelay,
    subWallets: { base58EncodedPrivateKeys },
    priorityFee,
  } = await getConfig(userId);
  
  ctx.reply("Volume generation starting... Use /stop to end the process early.");
  
  const poolKeys = (
    await fetchPoolKeys(connection, token, SOL_ADDRESS, "processed")
  )[0];

  isStopped = false;
  let i = 0;

  const performIteration = async () => {
    console.log("befor isstop",isStopped);
    
    if (isStopped || i >= noOfIterations) {
      clearInterval(volumeGenerationInterval);
      // await setExpiry(userId);
      ctx.reply("Volume generation stopped.");
      ctx.scene.enter(ScenesEnum.AUTH_SCENE);
      return;
    }

    console.log("after iteration");
    
    const amount = getRandomFloat(minSwapAmount, maxSwapAmount, 9);
    const delay = getRandomFloat(minSwapDelay, maxSwapDelay, 9);
    
    console.log("amount and delay",amount);
    console.log("amount and delay",delay);
    

    const privateKey = base58EncodedPrivateKeys[i % base58EncodedPrivateKeys.length];
    console.log("privateKey",privateKey);
    
    try {
      const buyTxHash = await swap(
        connection,
        Keypair.fromSecretKey(bs58.decode(privateKey)),
        amount,
        token,
        1, //slippage
        poolKeys,
        priorityFee * LAMPORTS_PER_SOL,
        "in"
      );
      console.log("buyTxHash: " + buyTxHash);
      
      // await ctx.reply(`https://solscan.io/tx/${buyTxHash}`);
      await ctx.reply(
        `✅ Buy Transaction Successful\n\n` +
        `🔗 <a href="https://solscan.io/tx/${buyTxHash}">View on Solscan</a>`,
        {
          parse_mode: 'HTML',
          disable_web_page_preview: true, // Type assertion will bypass this check
          reply_markup: keyboard.reply_markup
        } as any // Type assertion here
      );
      await waitSeconds(delay);
      
      const tokenBalance = await getTokenBalance(
        connection,
        token,
        base58EncodedPrivateKeyToBase58EncodedPublicKey(privateKey)
      );
      console.log("tokenBalance"+tokenBalance);

      if (tokenBalance < 0) {
        i++;
        return;
      }
      
      const sellTxHash = await swap(
        connection,
        Keypair.fromSecretKey(bs58.decode(privateKey)),
        tokenBalance,
        SOL_ADDRESS,
        1, //slippage
        poolKeys,
        priorityFee * LAMPORTS_PER_SOL,
        "in"
      );
      console.log("sellTxHash"+sellTxHash);
      
      // await ctx.reply(`https://solscan.io/tx/${sellTxHash}`);
      await ctx.replyWithHTML(
        `✅ Sell Transaction Successful\n\n` +
        `🔗 <a href="https://solscan.io/tx/${sellTxHash}">View on Solscan</a>`,
        {
          parse_mode: 'HTML',
          disable_web_page_preview: true,
          reply_markup: keyboard.reply_markup
        }  as any
      );
      await waitSeconds(delay);
    } catch (error: any) {
      await waitSeconds(DEFAULT_WAIT_SECONDS);
      console.log(error);
    }
    i++;
  };

  volumeGenerationInterval = setInterval(performIteration, 1000); // Adjust interval as needed
});

volumeGenerationScene.action('stop_generation', async (ctx) => {
  isStopped = true;
  if (volumeGenerationInterval) {
    clearInterval(volumeGenerationInterval);
  }
  await ctx.answerCbQuery('Volume generation stopped');
  await ctx.editMessageText("🛑 Volume generation stopped by user.");
  ctx.scene.enter(ScenesEnum.AUTH_SCENE);
});

volumeGenerationScene.command('stop', async (ctx) => {
  isStopped = true;
  if (volumeGenerationInterval) {
    clearInterval(volumeGenerationInterval);
  }
  ctx.reply("🛑 Volume generation stopped by user.");
});


// import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
// import { Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
// import { Scenes } from "telegraf";

// import { ScenesEnum, connection } from "../const";
// import { getConfig, getMainPrivateKey, setExpiry } from "../db";
// import { WalletBotContext } from "../Interfaces";
// import {
//   SOL_ADDRESS,
//   fetchPoolKeys,
//   getRandomFloat,
//   getTokenBalance,
//   swap,
//   waitSeconds,
// } from "../lib";
// import { DEFAULT_WAIT_SECONDS } from "../lib";
// import { base58EncodedPrivateKeyToBase58EncodedPublicKey } from "../lib/accounts";

// // volume generation scene
// export const volumeGenerationScene = new Scenes.BaseScene<WalletBotContext>(
//   ScenesEnum.VOLUME_GENERATION_PROGRESS
// );

// volumeGenerationScene.enter(async (ctx) => {
//   const noOfItterations = 10;
//   const userId = ctx?.from?.id as number;
//   const mainPrivateKey = await getMainPrivateKey(userId);
//   const {
//     token,
//     minSwapAmount,
//     maxSwapAmount,
//     minSwapDelay,
//     maxSwapDelay,
//     subWallets: { base58EncodedPrivateKeys },
//     priorityFee,
//   } = await getConfig(userId);
//   ctx.reply("Volume generation starting...");
//   const poolKeys = (
//     await fetchPoolKeys(connection, token, SOL_ADDRESS, "processed")
//   )[0];
//   for (let i = 0; i < noOfItterations; i++) {
//     const amount = getRandomFloat(minSwapAmount, maxSwapAmount, 9);
//     const delay = getRandomFloat(minSwapDelay, maxSwapDelay, 9);

//     const privateKey =
//       base58EncodedPrivateKeys[i % base58EncodedPrivateKeys.length];
//     try {
//       const buyTxHash = await swap(
//         connection,
//         Keypair.fromSecretKey(bs58.decode(privateKey)),
//         amount,
//         token,
//         1, //slippage
//         poolKeys,
//         priorityFee * LAMPORTS_PER_SOL,
//         "in"
//       );

//       await ctx.reply(`https://solscan.io/tx/${buyTxHash}`);
//       await waitSeconds(delay);

//       const tokenBalance = await getTokenBalance(
//         connection,
//         token,
//         base58EncodedPrivateKeyToBase58EncodedPublicKey(privateKey)
//       );

//       if (tokenBalance < 0) {
//         continue;
//       }

//       const sellTxHash = await swap(
//         connection,
//         Keypair.fromSecretKey(bs58.decode(privateKey)),
//         tokenBalance,
//         SOL_ADDRESS,
//         1, //slippage
//         poolKeys,
//         priorityFee * LAMPORTS_PER_SOL,
//         "in"
//       );

//       await ctx.reply(`https://solscan.io/tx/${sellTxHash}`);
//       await waitSeconds(delay);
//     } catch (error: any) {
//       // await ctx.reply(`Transfer failed ${error.message}`);
//       await waitSeconds(DEFAULT_WAIT_SECONDS);
//     }
//   }
//   await setExpiry(userId);
//   ctx.scene.enter(ScenesEnum.AUTH_SCENE);
// });
