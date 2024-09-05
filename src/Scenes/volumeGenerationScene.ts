import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Scenes } from "telegraf";
import { ScenesEnum, connection, MainFunctionsEnum } from "../const";
import { getConfig, getMainPrivateKey, setExpiry } from "../db";
import { WalletBotContext } from "../Interfaces";
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
  const noOfIterations = 30;
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
    if (isStopped || i >= noOfIterations) {
      clearInterval(volumeGenerationInterval);
      await setExpiry(userId);
      ctx.reply("Volume generation stopped.");
      ctx.scene.enter(ScenesEnum.AUTH_SCENE);
      return;
    }

    const amount = getRandomFloat(minSwapAmount, maxSwapAmount, 9);
    const delay = getRandomFloat(minSwapDelay, maxSwapDelay, 9);
    
    const privateKey = base58EncodedPrivateKeys[i % base58EncodedPrivateKeys.length];
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
      
      await ctx.reply(`https://solscan.io/tx/${buyTxHash}`);
      await waitSeconds(delay);
      
      const tokenBalance = await getTokenBalance(
        connection,
        token,
        base58EncodedPrivateKeyToBase58EncodedPublicKey(privateKey)
      );
      
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
      
      await ctx.reply(`https://solscan.io/tx/${sellTxHash}`);
      await waitSeconds(delay);
    } catch (error: any) {
      await waitSeconds(DEFAULT_WAIT_SECONDS);
    }
    i++;
  };

  volumeGenerationInterval = setInterval(performIteration, 1000); // Adjust interval as needed
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
