import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Markup, Scenes } from "telegraf";
import { MainFunctionsEnum, ScenesEnum, connection } from "../const";
import { getConfig, getMainPrivateKey } from "../db";
import { WalletBotContext } from "../Interfaces";
import { getSolBalance, transferSOL } from "../lib";
import { base58EncodedPrivateKeyToBase58EncodedPublicKey } from "../lib/accounts";

let isStopped = false;

// main scene
export const mainScene = new Scenes.BaseScene<WalletBotContext>(
  ScenesEnum.MAIN_SCENE
);
mainScene.enter(async (ctx) => {
  const menuOptions = Markup.inlineKeyboard([
    [
      Markup.button.callback(
        MainFunctionsEnum.SET_CONFIG,
        MainFunctionsEnum.SET_CONFIG
      )
    ],[
      Markup.button.callback(
        MainFunctionsEnum.CREATE_WALLETS,
        MainFunctionsEnum.CREATE_WALLETS
      )
    ],[
      Markup.button.callback(
        MainFunctionsEnum.TRANSFER,
        MainFunctionsEnum.TRANSFER
      )
    ],[
      Markup.button.callback(MainFunctionsEnum.START, MainFunctionsEnum.START),
      Markup.button.callback(
        MainFunctionsEnum.GET_BALANCE,
        MainFunctionsEnum.GET_BALANCE
      )
    ],[
      Markup.button.callback(
        MainFunctionsEnum.TRANSFER_BACK,
        MainFunctionsEnum.TRANSFER_BACK
      )
    ],
    [
      
        Markup.button.callback(
          MainFunctionsEnum.REFRESH,
          MainFunctionsEnum.REFRESH
        )
      ,
        Markup.button.callback(
          MainFunctionsEnum.HELP,
          MainFunctionsEnum.HELP
        )
      
    ],
    [
      Markup.button.callback(
        MainFunctionsEnum.STOP,
        MainFunctionsEnum.STOP
      )
    ]

 
  ]);

  ctx.reply("Please select an option", menuOptions);

});
// mainScene.enter(async (ctx) => {
//   const menuOptions = Markup.inlineKeyboard([
//     [
//       Markup.button.callback(
//         MainFunctionsEnum.SET_CONFIG,
//         MainFunctionsEnum.SET_CONFIG
//       ),
//       Markup.button.callback(
//         MainFunctionsEnum.CREATE_WALLETS,
//         MainFunctionsEnum.CREATE_WALLETS
//       ),
//       Markup.button.callback(
//         MainFunctionsEnum.TRANSFER,
//         MainFunctionsEnum.TRANSFER
//       ),
//     ],
//     [
//       Markup.button.callback(MainFunctionsEnum.START, MainFunctionsEnum.START),
//       Markup.button.callback(
//         MainFunctionsEnum.GET_BALANCE,
//         MainFunctionsEnum.GET_BALANCE
//       ),
//       Markup.button.callback(
//         MainFunctionsEnum.TRANSFER_BACK,
//         MainFunctionsEnum.TRANSFER_BACK
//       ),
//     ],
//   ]);
//   ctx.reply("Please select an option", menuOptions);
// });

mainScene.action(MainFunctionsEnum.SET_CONFIG, async (ctx) => {
  ctx.scene.enter(ScenesEnum.CONFIG_SCENE);
});

mainScene.action(MainFunctionsEnum.CREATE_WALLETS, async (ctx) => {
  ctx.scene.enter(ScenesEnum.SUB_WALLET_GENERSTION_SCENE);
});

mainScene.action(MainFunctionsEnum.TRANSFER, async (ctx) => {
  ctx.scene.enter(ScenesEnum.TRANSFER_FUNDS_SCENE);
});

mainScene.action(MainFunctionsEnum.START, async (ctx) => {
  ctx.scene.enter(ScenesEnum.VOLUME_GENERATION_PROGRESS);
});

mainScene.action(MainFunctionsEnum.HELP, async (ctx) => {
  await ctx.scene.enter(ScenesEnum.HELP_SCENE);
});

mainScene.action(MainFunctionsEnum.GET_BALANCE, async (ctx) => {
  ctx.reply("Getting balances...");
  const userId = ctx?.from?.id as number;

  const {
    subWallets: { base58EncodedPublicKeys },
  } = await getConfig(userId);
  for (const publicKey of base58EncodedPublicKeys) {
    try {
      const balance =
        (await getSolBalance(connection, publicKey)) / LAMPORTS_PER_SOL;

      // await ctx.reply(`Balance of ${publicKey} is ${balance} SOL`);
      await ctx.replyWithHTML(
        `💰 <b>Balance Update</b>\n\n` +
        `🔑 <b>Wallet Address:</b> <code>${publicKey}</code>\n\n` +
        `💸 <b>Current Balance:</b> ${balance} SOL`
      );
    } catch (error: any) {
      await ctx.reply(`Error getting balance of ${publicKey}`);
    }
  }
});

mainScene.action(MainFunctionsEnum.TRANSFER_BACK, async (ctx) => {
  ctx.reply("Transfering funds back...");

  const userId = ctx?.from?.id as number;
  const mainPrivateKey = await getMainPrivateKey(userId);
  const {
    subWallets: { base58EncodedPrivateKeys },
    priorityFee,
    maintenanceBalance,
  } = await getConfig(userId);
  for (const privateKey of base58EncodedPrivateKeys) {
    const balance = await getSolBalance(
      connection,
      base58EncodedPrivateKeyToBase58EncodedPublicKey(privateKey)
    );
    const amountToTransfer = balance - maintenanceBalance * LAMPORTS_PER_SOL;
    if (amountToTransfer > 0) {
      try {
        const txHash = await transferSOL(
          connection,
          amountToTransfer / LAMPORTS_PER_SOL,
          privateKey,
          base58EncodedPrivateKeyToBase58EncodedPublicKey(mainPrivateKey)
        );

        // await ctx.reply(`https://solscan.io/tx/${txHash}`);
        await ctx.replyWithHTML(
          `👜 <b>Transaction Back To Wallet</b>\n\n` +
          `🔗 <b>Transaction Details</b>\n\n` +
          `You can view the transaction details at the following link:\n` +
          `<a href="https://solscan.io/tx/${txHash}">📈 View Transaction on Solscan</a>\n\n`
        );
      } catch (error: any) {
        await ctx.reply(`Transfer failed ${error.message}`);
      }
    }
  }
});

mainScene.action(MainFunctionsEnum.TRANSFER_BACK, async (ctx) => {
  isStopped = true;
  console.log("Here");
});

// mainScene.action(MainFunctionsEnum.REFRESH, async (ctx) => {
//   await ctx.reply("Refreshing...");
//   ctx.scene.reenter(); // Re-enter the current scene to refresh it
// });

mainScene.action(MainFunctionsEnum.REFRESH, async (ctx) => {
  await ctx.reply("🔄 Refreshing balances...");

  const userId = ctx?.from?.id as number;

  // Get the user's wallet configuration
  const {
    wallets: { publicKey, privateKey },
    token,
  } = await getConfig(userId);

  // Loop through each wallet and get the balance
  // for (let i = 0; i < base58EncodedPublicKeys.length; i++) {

    try {
      const balance =
        (await getSolBalance(connection, publicKey)) / LAMPORTS_PER_SOL;

      // Display the balance with emojis and private key
      await ctx.replyWithHTML(
        `👜 <b>Deposit Wallet Address:</b> ➡️<code>${publicKey}</code>\n\n` +
        `🔑 <b>Deposit Private Key:</b> ➡️<code>${privateKey}</code>\n\n` +
        `🪪 <b>Token Address:</b> ➡️<code>${token || "Not setted token"}</code>\n\n` +
        `💰 <b>Balance:</b> ${balance || 0} SOL\n`
      );
    } catch (error: any) {
      await ctx.reply(`❗ Error getting balance of ${publicKey}`);
    }
  // }

  // Re-enter the current scene to refresh it
  ctx.scene.reenter();
});


mainScene.action(MainFunctionsEnum.STOP, async (ctx) => {
  isStopped = true;
  console.log("Here");
});

let loopInterval: any;

mainScene.command('stop', async (ctx) => {
  isStopped = true;
  if (loopInterval) {
    clearInterval(loopInterval);
  }
  ctx.reply("🛑 Loop stopped by user.");
  console.log("stop clicked");
});

mainScene.command('test', async (ctx) => {
  isStopped = false;
  ctx.reply("🔄 Loop started. Use /stop to end the loop early.");

  // Set a timer to stop the loop after 1 minute
  setTimeout(() => {
    isStopped = true;
    if (loopInterval) {
      clearInterval(loopInterval);
    }
    ctx.reply("⏰ 1 minute is up! The loop has been automatically stopped.");
  }, 60000);

  // Use setInterval instead of while loop
  loopInterval = setInterval(async () => {
    if (isStopped) {
      clearInterval(loopInterval);
      ctx.reply("✅ Loop has been stopped.");
      return;
    }

    console.log("Loop iteration");
    await ctx.reply("🔁 Running loop...");
  }, 5000);
});

// Add this to your mainScene

// mainScene.action(MainFunctionsEnum.STOP, async (ctx) => {
//   isStopped = true;
//   if (volumeGenerationInterval) {
//     clearInterval(volumeGenerationInterval);
//   }
//   ctx.reply("🛑 Volume generation stopped by user.");
//   console.log("Stop clicked in main scene");
// });