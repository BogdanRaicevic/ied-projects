import { mongo } from '../../deps.ts';
import { db } from '../database/db.ts';
import { config } from '../../deps.ts';

const env = config();

type User = {
  _id: { $oid: string };
  name: string;
  email: string;
  password: string;
};

export const findUserByName = async (email: string) => {
  try {
    const collection: mongo.Collection<User> = db.collection(
      env.MONGO_DB_USER_COLLECTION
    );

    const user = await collection.findOne({ email });

    return user;
  } catch (error) {
    console.error('Error finding user by username:', error);
    throw new Error('Error finding user by username');
  }
};
