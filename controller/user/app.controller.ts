import user from "../../database/userSchema"; // adjust path based on your structure
import { Response, Request } from "express";
import { UserType } from "../../database/userSchema";
import bcrypt from 'bcrypt'

export const createUser = async (req: Request, res: Response) => {
  const { firstName, Email, Password, About } = req.body;

  try {
    const normalizedEmail = Email.toLowerCase();
    const hashedPassword = await bcrypt.hash(Password, 10);

    const newUser = new user({
      firstName,
      Email: normalizedEmail,
      Password: hashedPassword,
      About,
    });

    await newUser.save();

    // Redirect after successful creation
    return res.redirect("/dashboard/users");; // or wherever you show the user list
  } catch (err) {
    console.error("Error creating user:", err);
    return res.status(500).json({ message: "Failed to create user." });
  }
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

export const deleteUserByEmail = async (Email: string) => {
  try {
    const deletedUser = await user.findOneAndDelete({ Email });

    if (!deletedUser) {
      throw new Error("User not found.");
    }

    return deletedUser;
  } catch (error) {
    throw error;
  }
};