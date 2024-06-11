import mongoose from 'mongoose';

type User = {
  _id: { $oid: string };
  name: string;
  email: string;
  password: string;
  salt: string;
};

const UserSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  email: { type: String },
  password: { type: String },
  salt: { type: String },
});
const UserModel = mongoose.model('User', UserSchema);

export const findUserByName = async (email: string) => {
  try {
    const user = await UserModel.findOne({ email });

    return user;
  } catch (error) {
    console.error('Error finding user by username:', error);
    throw new Error('Error finding user by username');
  }
};

export const createUser = async (userInput: User) => {
  try {
    const salt = crypto.getRandomValues(new Uint8Array(16)).toString();
    userInput.salt = salt;

    const encoder = new TextEncoder();
    const passwordData = encoder.encode(userInput.password + salt);

    userInput.password = (
      await crypto.subtle.digest('SHA-256', passwordData)
    ).toString();

    const createdUser = UserModel.create(userInput);

    return createdUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('Error creating user');
  }
};
