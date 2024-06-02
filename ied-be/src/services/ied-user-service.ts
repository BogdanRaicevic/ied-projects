import { mongo } from '../../deps.ts';
import { ENV } from '../../envVariables.ts';
import { db } from '../database/db.ts';

type User = {
  _id: { $oid: string };
  name: string;
  email: string;
  password: string;
  salt: string;
};

export const findUserByName = async (email: string) => {
  try {
    const collection: mongo.Collection<User> = db.collection(
      ENV.dbUserCollection
    );

    const user = await collection.findOne({ email });

    return user;
  } catch (error) {
    console.error('Error finding user by username:', error);
    throw new Error('Error finding user by username');
  }
};

export const createUser = async (user: User) => {
  try {
    const collection: mongo.Collection<User> = db.collection(
      ENV.dbUserCollection
    );

    const salt = crypto.getRandomValues(new Uint8Array(16)).toString();
    user.salt = salt;

    const encoder = new TextEncoder();
    const passwordData = encoder.encode(user.password + salt);

    user.password = (
      await crypto.subtle.digest('SHA-256', passwordData)
    ).toString();

    const result = await collection.insertOne(user);

    return result;
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('Error creating user');
  }
};
