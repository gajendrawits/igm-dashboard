import { Request, Response, NextFunction } from "express";
import { CustomSession } from "../types/express-session";
const checkSession = (
  req: Request & { session: CustomSession },
  res: Response,
  next: NextFunction
) => {
  console.log(req.session.userId);

  if (req.session && req.session?.userId) {
    console.log(req.route);
    // Session exists, proceed to the next middleware or route handler
    next();
  } else {
    // Session does not exist, redirect to the login page
    res.redirect("/auth/sign-in");
  }
};

export default checkSession;
