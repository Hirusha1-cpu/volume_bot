import { Scenes, Markup } from "telegraf";
import { MainFunctionsEnum, DefaultEnum, ScenesEnum } from "../const";
import { WalletBotContext } from "../Interfaces";
import { message } from "telegraf/filters";

// Help scene
export const helpScene = new Scenes.BaseScene<WalletBotContext>(
    ScenesEnum.HELP_SCENE // This should now be "HELP_SCENE"
);

helpScene.enter(async (ctx) => {
  // Display a help message with a list of commands
  await ctx.replyWithHTML(
    `<b>Welcome to the Solana Telegram Bot Help Menu!</b>\n\n` +
    `Here are the commands you can use:\n\n` +
    `🔹 <b>/setconfig</b> - Configure the bot with your settings.\n` +
    `🔹 <b>/createwallets</b> - Create new wallets.\n` +
    `🔹 <b>/transfer</b> - Transfer SOL between wallets.\n` +
    `🔹 <b>/start</b> - Start a process (like volume generation).\n` +
    `🔹 <b>/getbalance</b> - Get the balance of all your wallets.\n` +
    `🔹 <b>/transferback</b> - Transfer all SOL back to your main wallet.\n` +
    `🔹 <b>/refresh</b> - Refresh the current scene or menu.\n` +
    `🔹 <b>/stop</b> - Stop any ongoing process.\n\n` +
    `🔹 <b>/help</b> - Show this help menu.\n\n` +
    `To use a command, simply type the command or select an option from the menu.`
  );

  // Optionally, you could display a button to go back to the main menu
  const backToMenuButton = Markup.inlineKeyboard([
    Markup.button.callback("Back to Menu", MainFunctionsEnum.REFRESH)
  ]);
  
  await ctx.reply("What would you like to do next?", backToMenuButton);
});

helpScene.on(message("text"), async (ctx) => {
  await ctx.reply("Please use the buttons or type a command to navigate the bot.");
});

helpScene.action(DefaultEnum.SET_DEFAULT, async (ctx) => {
  // Provide a default action if needed
  await ctx.reply("Setting default values...");
  // You can navigate to another scene or perform any default action here
});

helpScene.action(MainFunctionsEnum.REFRESH, async (ctx) => {
    // await ctx.reply("Refreshing...");
    // Delay to ensure the message is sent
    setTimeout(() => ctx.scene.enter(ScenesEnum.MAIN_SCENE), 500);
});

export default helpScene;
