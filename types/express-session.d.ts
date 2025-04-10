import { Session } from "express-session";

export interface CustomSession extends Session {
  userId?: string; // Replace 'string' with the appropriate type for your user ID
  // Add other custom session properties as needed
}
