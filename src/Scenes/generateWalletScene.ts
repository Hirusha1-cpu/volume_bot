import { Context, Markup, Scenes } from "telegraf";
import { message } from "telegraf/filters";
import { Connection, PublicKey } from "@solana/web3.js"; // Import necessary Solana packages

import { CommandEnum, CommonEnum, ScenesEnum, logger } from "../const";
import { getDoesUserHaveMainWallet, setMainPrivateKey, getConfig ,setConfig} from "../db";
import { WalletBotContext } from "../Interfaces";
import { generateKeyPairs } from "../lib";

async function createNewWallet(userId: number, ctx: Context) {
  try {
    const keyPair = generateKeyPairs(1);

    const privateKey = keyPair.base58EncodedPrivateKeys[0];
    const publicKey = keyPair.base58EncodedPublicKeys[0];

    await setMainPrivateKey(privateKey, userId);
    
    // Set up a connection to the Solana blockchain (using the devnet as an example)
    const connection = new Connection(
      "https://api.devnet.solana.com",
      "confirmed"
    );

    
    // Convert the public key string into a PublicKey object
    const walletPublicKey = new PublicKey(publicKey);

    // Fetch the balance of the wallet
    const balance = await connection.getBalance(walletPublicKey);
    const balanceInSOL = balance / 1e9; // Convert lamports to SOL
    console.log(balanceInSOL);
     // Save the updated configuration back to the database
     await setConfig({ wallets: { publicKey, privateKey } }, userId);
    // await ctx.reply(
    //   `👋 Welcome to the Solana Telegram Bot\\! \n\n🎖️ Main wallet created\\.\n\n 👜 Send funds to this address ➡️ \n\`${publicKey}\`\n\n ✨ This is your private key ➡️ \n\`${privateKey}\` \n\n 💸 Balance: 0 SOL`,
    //   // `<size=16>👋 Welcome to the Solana Telegram Bot!</size>\n\n**🎖️ Main wallet created.**\n\n**👜 Send funds to this address ➡️**\n\`${publicKey}\`\n\n**✨ This is your private key ➡️**\n\`${privateKey}\`\n\n**💸 Balance: 0 SOL**`,

    //   {
    //     parse_mode: "MarkdownV2",
    //   }
    // );
    await ctx.replyWithHTML(
      `<b>👋 Welcome to the Solana Telegram Bot!</b>\n\n` +
        `🎖️ <b>Main wallet created.</b>\n\n` +
        `👜 <b>Send funds to this address</b> ➡️<code>${publicKey}</code>\n\n` +
        `✨ <b>This is your private key</b> ➡️<code>${privateKey}</code>\n\n` +
        `💸 Balance: ${balanceInSOL} SOL`
    );
  } catch (error) {
    logger.error(error as string);
    await ctx.reply("Error creating wallet. Please try again...");
  }
}
// Create wallet scene
export const generateMainWalletScene = new Scenes.BaseScene<WalletBotContext>(
  ScenesEnum.GENERATE_MAIN_WALLET_SCENE
);

generateMainWalletScene.start((ctx) => {
  ctx.scene.enter(ScenesEnum.AUTH_SCENE);
});

generateMainWalletScene.enter(async (ctx) => {
  const userId = ctx?.from?.id as number;
  //check the user already have a wallet, if not create one. If yes ask whether they want to create one. Ideally this should be getting from a DB.
  const userHaveWallet = await getDoesUserHaveMainWallet(userId);
  if (userHaveWallet) {
    const menuOptions = Markup.inlineKeyboard([
      [Markup.button.callback(CommonEnum.YES, CommonEnum.YES)],
      [Markup.button.callback(CommonEnum.NO, CommonEnum.NO)],
    ]);
    ctx.reply(
      "You already have a wallet. Do you want to create new one?",
      menuOptions
    );
  } else {
    await createNewWallet(userId, ctx);
    ctx.scene.enter(ScenesEnum.MAIN_SCENE);
  }
});

generateMainWalletScene.action(CommonEnum.YES, async (ctx) => {
  const userId = ctx?.from?.id as number;
  await ctx.editMessageReplyMarkup(undefined);

  await createNewWallet(userId, ctx);
  ctx.scene.enter(ScenesEnum.MAIN_SCENE);
});

generateMainWalletScene.action(CommonEnum.NO, async (ctx) => {
  ctx.scene.enter(ScenesEnum.MAIN_SCENE);
});

generateMainWalletScene.on(message("text"), (ctx) => {
  ctx.reply("Please choose one of the options.");
});

generateMainWalletScene.command(CommandEnum.TRY_AGAIN, async (ctx) => {
  const userId = ctx?.from?.id as number;
  await ctx.editMessageReplyMarkup(undefined);

  await createNewWallet(userId, ctx);
  ctx.scene.enter(ScenesEnum.MAIN_SCENE);
});
