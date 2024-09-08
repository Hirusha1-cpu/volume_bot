import { Connection } from "@solana/web3.js";
import dotenv from "dotenv";

import Logger from "./logger";

dotenv.config();

export const BOT_TOKEN = process.env.BOT_TOKEN as string;
export const MONGO_DB_URI = process.env.MONGO_DB_URI as string;
export const DB_NAME = process.env.DB_NAME as string;
export const COLLECTION_NAME = process.env.COLLECTION_NAME as string;

export const DB_NAME_USER_TOKEN = process.env.DB_NAME_USER_TOKEN as string;
export const COLLECTION_NAME_USER_TOKEN = process.env.COLLECTION_NAME_USER_TOKEN as string;

export const logger = new Logger();

export enum ScenesEnum {
  AUTH_SCENE = "AUTH_SCENE",
  GENERATE_MAIN_WALLET_SCENE = "GENERATE_WALLET_SCENE",
  MAIN_SCENE = "MAIN_SCENE",
  CONFIG_SCENE = "CONFIG_SCENE",
  SUB_WALLETS_SCENE = "SUB_WALLETS_SCENE",
  SET_TOKEN_SCENE = "SET_TOKEN_SCENE",
  SET_MIN_SWAP_AMOUNT_SCENE = "SET_MIN_SWAP_AMOUNT_SCENE",
  SET_MAX_SWAP_AMOUNT_SCENE = "SET_MAX_SWAP_AMOUNT_SCENE",
  SET_MIN_DELAY_SCENE = "SET_MIN_DELAY_SCENE",
  SET_MAX_DELAY_SCENE = "SET_MAX_DELAY_SCENE",
  SET_PRIORITY_FEE_SCENE = "SET_PRIORITY_FEE_SCENE",
  SET_MAINTENANCE_BALANCE_SCENE = "SET_MAINTENANCE_BALANCE_SCENE",
  SUB_WALLET_GENERSTION_SCENE = "SUB_WALLET_GENERSTION_SCENE",
  TRANSFER_FUNDS_SCENE = "TRANSFER_FUNDS_SCENE",
  VOLUME_GENERATION_PROGRESS = "VOLUME_GENERATION_PROGRESS",
  HELP_SCENE = "HELP_SCENE",
  SET_RPC_URL_SCENE = "SET_RPC_URL_SCENE",
}

export enum CommandEnum {
  CREATE = "create",
  BACK = "back",
  EXIT = "exit",
  TRY_AGAIN = "tryAgain",
}

export enum CommonEnum {
  BACK = "Back",
  YES = "Yes",
  NO = "No",
  ACCEPT = "Accept",
  DECLINE = "Decline",
}

export enum MainFunctionsEnum {
  SET_CONFIG = "🎖 Set Config",
  CREATE_WALLETS = "💼 Create Walletes",
  TRANSFER = "💸 Transfer",
  START = "🚀 Start",
  GET_BALANCE = "💰 Get Balance",
  TRANSFER_BACK = "💵 Transfe Funds Back",
  STOP = "⏹️ Stop",
  REFRESH = "🔄 Refresh",
  HELP = "❓ Help"
}

export enum ConfigFunctionsEnum {
  SET_TOKEN = "📜 Set Token",
  SET_SWAP_AMOUNT = "💶 Set Swap Amount",
  SET_DELAY = "⏳ Set Delay",
  SET_PRIORITY_FEE = "💵 Set Priority Fee",
  SET_MIN_MAINTENANCE_BALANCE = "💰 Set Minimum Maintenance Balance",
  SET_RPC_URL = "🪫 Set RPC URL",
}
export enum ContactUsEnum {
  SET_TOKEN = "📜 Set Token",
  SET_CONTACT_US = "☎️ Contact Us",
}

export enum DefaultEnum {
  SET_DEFAULT = "🧮 Set Default",
  SET_VALUE = "📝 Set Value",
}

export const derivationPath = "m/44'/501'/0'/0'";

export const rpcUrl = process.env.RPC_URL as string;

export const connection = new Connection(rpcUrl, {
  commitment: "confirmed",
});
