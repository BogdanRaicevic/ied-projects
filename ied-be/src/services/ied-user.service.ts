import { User } from "../models/user.model";

export const findUserByEmail = async (email: string) => {
  try {
    return User.findOne({ email });
  } catch (error) {
    console.error("Error finding user by username:", error);
    throw new Error("Error finding user by username");
  }
};

// export const createUser = async (userInput: User) => {
//   try {
//     const salt = crypto.getRandomValues(new Uint8Array(16)).toString();
//     userInput.salt = salt;

//     const encoder = new TextEncoder();
//     const passwordData = encoder.encode(userInput.password + salt);

//     userInput.password = (await crypto.subtle.digest("SHA-256", passwordData)).toString();

//     const createdUser = UserModel.create(userInput);

//     return createdUser;
//   } catch (error) {
//     console.error("Error creating user:", error);
//     throw new Error("Error creating user");
//   }
// };
