import mongoose from "mongoose";


export interface UserType extends mongoose.Document {
    firstName: string;
    LastName : string;
    Email: string;
    Password: string;
    About: string;
  }

  const userSchema = new mongoose.Schema<UserType>({
    firstName: { type: String, required: true },
    LastName: {type: String, required: false},
    Email: { type: String, required: true },
    Password: { type: String, required: true },
    About: { type: String, required: true },
  });
  
  const user = mongoose.model<UserType>("User", userSchema);

// const user = mongoose.model('user', userSchema)
export default user