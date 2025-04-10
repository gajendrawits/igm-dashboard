import { body, validationResult } from "express-validator";
import express from "express";
import { Response, Request } from "express";
import path from "path";
import { CustomSession } from "types/express-session";
// import checkSession from "../../middleware/dashboard";
// import checkSession from "../../middleware/dashboard";

const router = express.Router();

// POST route for user login
router.post(
  "/login",

  [
    // Validate email
    body("email").isEmail().withMessage("Please enter a valid email address."),
    // Validate password
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long."),
  ],
  (req: Request & { session: CustomSession }, res: Response) => {
    // Extract validation errors
    const errors = validationResult(req);
    console.log("req.session");
    console.log(req.session);

    // if (req.session.id) {
    //   res.redirect("/dashboard");
    // }
    if (!errors.isEmpty()) {
      // Return errors if validation fails
      return res.status(400).json({ errors: errors.array() });
    }

    // Proceed with authentication logic here
    const { email, password } = req.body;

    // Example: Authenticate user (this should be replaced with actual authentication logic)
    if (
      email === "gajendra.mehra@thewitslab.com" &&
      password === "gajendra.mehra@thewitslab.com"
    ) {
      req.session.userId = email;

      // Redirect to dashboard
      return res.redirect("/dashboard");
    } else {
      return res.status(401).json({ message: "Invalid credentials." });
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
