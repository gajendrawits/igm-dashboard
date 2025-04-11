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

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { userId, firstName, LastName, email, Password, about } = req.body;

    if (!userId) {
      return res.status(400).send("User ID is required."); // ✅ Add return here
    }

    const updatedUser = await user.findByIdAndUpdate(
      userId,
      {
        firstName,
        LastName,
        email,
        Password, // Hash this ideally
        about,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).send("User not found."); // ✅ Also returns
    }

    return res.redirect('/dashboard'); // ✅ Add return to satisfy TS
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).send("Internal Server Error"); // ✅ Add return here too
  }
};

export const deleteuser = async (req: Request): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const { Email } = req.body;

    if (!Email) {
      return { success: false, message: 'Email is required' };
    }

    const deletedUser = await user.findOneAndDelete({ Email });

    if (!deletedUser) {
      return { success: false, message: 'User not found' };
    }

    console.log(`Deleted user: ${Email}`);
    return { success: true, message: 'User deleted successfully' };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, message: 'Server error' };
  }
};