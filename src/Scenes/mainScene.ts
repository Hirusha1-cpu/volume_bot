import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Markup, Scenes } from "telegraf";

import { MainFunctionsEnum, ScenesEnum, connection } from "../const";
import { getConfig, getMainPrivateKey } from "../db";
import { WalletBotContext } from "../Interfaces";
import { getSolBalance, transferSOL } from "../lib";
import { waitSeconds } from "../lib";
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
      ),
      Markup.button.callback(
        MainFunctionsEnum.CREATE_WALLETS,
        MainFunctionsEnum.CREATE_WALLETS
      ),
      Markup.button.callback(
        MainFunctionsEnum.TRANSFER,
        MainFunctionsEnum.TRANSFER
      ),
    ],
    [
      Markup.button.callback(MainFunctionsEnum.START, MainFunctionsEnum.START),
      Markup.button.callback(
        MainFunctionsEnum.GET_BALANCE,
        MainFunctionsEnum.GET_BALANCE
      ),
      Markup.button.callback(
        MainFunctionsEnum.TRANSFER_BACK,
        MainFunctionsEnum.TRANSFER_BACK
      ),
    ],
  ]);
  ctx.reply("Please select an option", menuOptions);
});

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

      await ctx.reply(`Balance of ${publicKey} is ${balance} SOL`);
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

        await ctx.reply(`https://solscan.io/tx/${txHash}`);
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
