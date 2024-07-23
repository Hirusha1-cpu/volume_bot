import { MongoClient } from "mongodb";

import { COLLECTION_NAME, DB_NAME, MONGO_DB_URI, logger } from "./const";

// Initialize MongoDB client
const client = new MongoClient(MONGO_DB_URI);
client.connect().catch((error) => logger.error(error));
const db = client.db(DB_NAME);
export const usersCollection = db.collection(COLLECTION_NAME);

export async function setMainPrivateKey(
  mainPrivateKey: string,
  userId: number
) {
  try {
    await usersCollection.updateOne(
      { userId },
      { $set: { mainPrivateKey } },
      { upsert: true }
    );
  } catch (error) {
    logger.error(error as string);
  }
}

export async function getMainPrivateKey(userId: number) {
  try {
    const user = await usersCollection.findOne({ userId });
    if (!user) {
      return null;
    }
    const privateKey = user.mainPrivateKey;
    return privateKey || null;
  } catch (error) {
    logger.error(error as string);
  }
}

export async function getDoesUserHaveMainWallet(userId: number) {
  try {
    const user = await usersCollection.findOne({ userId });
    if (!user) {
      return false;
    }
    return !!user.mainPrivateKey;
  } catch (error) {
    logger.error(error as string);
  }
}

export async function setConfig(data: any, userId: number) {
  try {
    await usersCollection.updateOne(
      { userId },
      { $set: { ...data } },
      { upsert: true }
    );
  } catch (error) {
    logger.error(error as string);
  }
}

export async function getConfig(userId: number) {
  try {
    const user = await usersCollection.findOne({ userId });
    if (!user) {
      return null;
    }
    return user as any;
  } catch (error) {
    logger.error(error as string);
  }
}

export async function setExpiry(userId: number) {
  try {
    await usersCollection.updateOne(
      { userId },
      { $set: { expiry: true } },
      { upsert: true }
    );
  } catch (error) {
    logger.error(error as string);
  }
}

export async function getExpiry(userId: number) {
  try {
    const user = await usersCollection.findOne({ userId });
    if (!user) {
      return null;
    }
    return !!user.expiry;
  } catch (error) {
    logger.error(error as string);
  }
}
