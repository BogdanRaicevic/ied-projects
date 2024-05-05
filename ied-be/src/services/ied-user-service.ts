import { mongo } from '../../deps.ts';
import { db } from '../database/db.ts';

type User = {
  _id: { $oid: string };
  name: string;
  email: string;
  password: string;
};

export const findUserByName = async (name: string) => {
  try {
    const collection: mongo.Collection<User> = db.collection('users'); // Replace with your collection name

    const user = await collection.findOne({ name });

    return user;
  } catch (error) {
    console.error('Error finding user by username:', error);
    throw new Error('Error finding user by username');
  }
};
