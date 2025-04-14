import express from "express";
import checkSession from "../../middleware/dashboard";

import { Response, Request } from "express";
import {
  listUsers,
  createUser,
  updateUser,
  deleteUserByEmail,
  // searchUsersByEmail
} from "../../controller/user/app.controller";

const router = express.Router();

// POST route for user login

router.get("/", checkSession, (_req: Request, res: Response) => {
  res.render("index", {
    layout: "../layouts/dashboard",
    footer: true,
  });
});

router.get("/issue-open", checkSession, (_req, res) => {
  const products = require("../../data/products.json");
  res.render("crud/products", {
    layout: "../layouts/dashboard",
    footer: false,
    products,
  });
});

router.get("/issue-closed", checkSession, (_req, res) => {
  const products = require("../../data/products.json");

  res.render("crud/products", {
    layout: "../layouts/dashboard",
    footer: false,
    products,
  });
});
router.get("/issue-all", checkSession, (_req, res) => {
  const products = require("./data/products.json");
  res.render("crud/products", {
    layout: "../layouts/dashboard",
    footer: false,
    products,
  });
});

router.get("/users", checkSession, async (_req, res) => {
  try {
    const users = await listUsers(); // get users from controller
    console.log("🚀 ~ router.get ~ users:", users);

    res.render("crud/users", {
      layout: "../layouts/dashboard",
      footer: false,
      users,
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    res.status(500).send("Error loading users: " + errMsg);
  }
});

router.post("/createuser", checkSession, async (req, res) => {
  try {
    await createUser(req, res); // `createUser` handles redirect
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    res.status(500).send("Error creating user: " + errMsg);
  }
});

router.get("/excelExport", (_req, res) => {
  res.render("crud/excel", {
    layout: "../layouts/dashboard",
    footer: false,
  });
});

// router.post("/dashboard/updateuser", (_req, res) => {
//   res.render("crud/users", {
//     layout: "../layouts/dashboard",
//     footer: false,
//   });

//   // Update logic here
//   res.redirect("/dashboard"); // or render success
// });

router.post("/updateusers", checkSession, async (req, res) => {
  try {
    // Call the updateUser controller, which handles the user update
    await updateUser(req, res); // This will already handle the response, so make sure `updateUser` doesn't send a response directly

    // After updating, fetch the updated list of users
    const users = await listUsers(); // Fetch updated users list from the database

    // Render the users page and pass the updated user data along with the user list
    res.render("crud/users", {
      layout: "../layouts/dashboard",
      footer: false,
      users, // Pass the updated users list
      updateUser, // Pass the updated user data to the template
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    res.status(500).send("Error updating user: " + errMsg);
  }
});
router.post("/deleteuser", checkSession, async (req, res) => {
  try {
    const { Email } = req.body;
    await deleteUserByEmail(Email); // just pass the email

    const users = await listUsers();

    res.render("crud/users", {
      layout: "../layouts/dashboard",
      footer: false,
      users,
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    res.status(500).send("Error deleting user: " + errMsg);
  }
});

export default router;
// router.get("/search", checkSession, async (req, res) => {
//   try {
//     await searchUsersByEmail(req, res); // 🧼 Clean call without res

//     const users = await listUsers(); // refreshed list

//     res.render("crud/users", {
//       layout: "../layouts/dashboard",
//       footer: false,
//       users,
//     });
//   } catch (error) {
//     const errMsg = error instanceof Error ? error.message : String(error);
//     res.status(500).send("Error deleting user: " + errMsg);
//   }
// });

