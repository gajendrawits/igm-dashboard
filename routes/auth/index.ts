import { body, validationResult } from "express-validator";
import express from "express";
import { Response, Request } from "express";
import path from "path";
import { CustomSession } from "types/express-session";
import user from "../../database/userSchema"
import bcrypt from "bcrypt"
// import checkSession from "../../middleware/dashboard";
// import checkSession from "../../middleware/dashboard";

const router = express.Router();

// POST route for user login
router.post(
  "/login",
  [
    // Validate email (using lowercase "email")
    body("email").isEmail().withMessage("Please enter a valid email address."),
    // Validate password
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long."),
  ],
  async (req: Request & { session: CustomSession }, res: Response) => {
    console.log("🚀 ~ Route hit");
    
    // Extract validation errors
    const errors = validationResult(req);
    console.log("🚀 ~ req.session:", req.session);
    console.log("🚀 ~ Validation errors:", errors.array());

    if (!errors.isEmpty()) {
      // Return errors if validation fails
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { email, password } = req.body;
    console.log("🚀 ~ email, password:", email, password);

    try {
      // Find user by email
      const foundUser = await user.findOne({ Email: email.toLowerCase() });
      console.log("🚀 ~ foundUser:", foundUser);
      console.log("🚀 ~ req.body:", req.body);

      if (!foundUser) {
        return res.status(401).json({ message: "No user found." });
      }

      // Check if the password is correct (assuming passwords are hashed)
      const isPasswordCorrect = await bcrypt.compare(password, foundUser.Password);
      console.log("🚀 ~ isPasswordCorrect:", isPasswordCorrect);
      if (!isPasswordCorrect) {
        return res.status(401).json({ message: "Invalid credentials." });
      }

      // Create a session after successful authentication
      req.session.userId = foundUser._id;

      // Redirect to dashboard or any other page
      return res.redirect("/dashboard");

    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "An error occurred during login." });
    }
  }
);

router.get("/sign-in", (req: Request & { session: CustomSession }, res) => {
  if (req.session.userId) {
    // Redirect to the dashboard if user is signed in
    return res.redirect("/dashboard");
  }
  return res.render("authentication/sign-in", {
    layout: path.join("../layouts/main"),
    navigation: false,
    footer: false,
  });
});

router.post(
  "/sign-out",
  (req: Request & { session: CustomSession }, res: Response) => {
    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        // Handle error during session destruction
        return res.status(500).send("Error logging out");
      }

      // Clear the session cookie
      res.clearCookie("connect.sid", {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Set to true if using HTTPS
      });

      // Redirect to the home page or login page
      return res.redirect("/");
    });
  }
);

export default router;
