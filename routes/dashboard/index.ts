import express from "express";
import checkSession from "../../middleware/dashboard";
// import path from "path";
import { Response, Request } from "express";
import { listUsers, createUser } from "../../controller/user/app.controller";

const router = express.Router();

// POST route for user login

router.get("/", checkSession, (_req: Request, res: Response) => {
  res.render("index", {
    layout: "../layouts/dashboard",
    footer: true,
  });
});

router.get("/issue-open",checkSession, (_req, res) => {
  const products = require("../../data/products.json");
  res.render("crud/products", {
    layout: "../layouts/dashboard",
    footer: false,
    products,
  });
});

router.get("/issue-closed",checkSession, (_req, res) => {
  const products = require("../../data/products.json");

  res.render("crud/products", {
    layout: "../layouts/dashboard",
    footer: false,
    products,
  });
});
router.get("/issue-all", checkSession,(_req, res) => {
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
    console.log("🚀 ~ router.get ~ users:", users)

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
    await createUser(req, res); // save new user

    const users = await listUsers(); // fetch updated user list

    res.render("crud/users", {
      layout: "../layouts/dashboard",
      footer: false,
      users, // ✅ pass updated users here
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    res.status(500).send("Error creating user: " + errMsg);
  }
});

export default router;
