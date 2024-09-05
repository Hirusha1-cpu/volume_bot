import { MongoClient } from "mongodb";

import { COLLECTION_NAME, DB_NAME, MONGO_DB_URI, logger,DB_NAME_USER_TOKEN,COLLECTION_NAME_USER_TOKEN } from "./const";

// Initialize MongoDB client
const client = new MongoClient(MONGO_DB_URI);
client.connect().catch((error) => logger.error(error));
const db = client.db(DB_NAME);
export const usersCollection = db.collection(COLLECTION_NAME);

const db_usertoken = client.db(DB_NAME_USER_TOKEN);
export const usersCollection_usertoken = db_usertoken.collection(COLLECTION_NAME_USER_TOKEN);

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

export async function getTokenAddressOfUser(token: string) {
  try {
    // Query the collection to find a document where the token_address array contains the specified token
    const user_token = await usersCollection_usertoken.findOne({
      token_address: { $elemMatch: { $eq: token } }
    });

    if (!user_token) {
      return null;
    }

    // Return the token if found, otherwise return null
    return user_token;
  } catch (error) {
    logger.error(error as string);
    return null;
  }
}

// export async function getTokenAddressOfUser(token: string) {
//   try {
//     const user_token = await usersCollection_usertoken.findOne({ token_address: token });
//     if (!user_token) {
//       return null;
//     }
//     return user_token.token_address || null;
//   } catch (error) {
//     logger.error(error as string);
//     return null;
//   }
// }
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
    // Define default configuration
    const defaultConfig = {
      // token: "defaultToken",
      minSwapAmount: 0.00001,
      maxSwapAmount: 0.00005,
      minSwapDelay: 10,
      maxSwapDelay: 12,
      priorityFee: 0.001,
      maintenanceBalance: 0.001,
      subWallets: data?.subWallets || { base58EncodedPrivateKeys: [], base58EncodedPublicKeys: [] } 
      // Default subWallets to empty arrays if not provided
    };

    // Check if all required fields are present in `data`
    const requiredFields = ['minSwapAmount', 'maxSwapAmount', 'minSwapDelay', 'maxSwapDelay', 'priorityFee', 'maintenanceBalance'];
    const isDataValid = requiredFields.every(field => data && data[field] !== undefined);

    if (isDataValid) {
      // If all required fields are present, update with the provided data
      await usersCollection.updateOne(
        { userId },
        { $set: { ...data } },
        { upsert: true }
      );
      console.log("Updated with provided data");
    } else {
      // If any required fields are missing, set the configuration with default values
      await usersCollection.updateOne(
        { userId },
        { $set: { ...defaultConfig, ...data } },
        { upsert: true }
      );
      console.log("Updated with default values");
    }
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
