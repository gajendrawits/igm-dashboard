import user from "../../database/userSchema"; // adjust path based on your structure
import { Response, Request } from "express";
import { UserType } from "../../database/userSchema";

export const createUser = async (req: Request, _res: Response) => {
  const { firstName, Email, Password, About } = req.body;

  const newUser = new user({ firstName, Email, Password, About });
  await newUser.save();
};

export const listUsers = async (): Promise<UserType[]> => {
  try {
    const users = await user.find();
    console.log("🚀 ~ listUsers ~ users:", users);
    return users;
  } catch (error) {
    throw error; // Let the caller handle the error
  }
};
