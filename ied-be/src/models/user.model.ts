import { Schema, model } from "mongoose";

type UserType = {
  name: string;
  email: string;
  password: string;
  salt: string;
};

const UserSchema = new Schema<UserType>();

const User = model<UserType>("User", UserSchema);

export { UserType, User };
