import express from "express";
import checkSession from "../../middleware/dashboard";
// import path from "path";

const router = express.Router();

// POST route for user login

router.get("/", checkSession, (_req, res) => {
  res.render("index", {
    layout: "../layouts/dashboard",
    footer: true,
  });
});

router.get("/issue-open", (_req, res) => {
  const products = require("../../data/products.json");
  res.render("crud/products", {
    layout: "../layouts/dashboard",
    footer: false,
    products,
  });
});

router.get("/issue-closed", (_req, res) => {
  const products = require("../../data/products.json");

  res.render("crud/products", {
    layout: "../layouts/dashboard",
    footer: false,
    products,
  });
});
router.get("/issue-all", (_req, res) => {
  const products = require("./data/products.json");
  res.render("crud/products", {
    layout: "../layouts/dashboard",
    footer: false,
    products,
  });
});

router.get("/users", (_req, res) => {
  const users = require("../../data/users.json");
  res.render("crud/users", {
    layout: "../layouts/dashboard",
    footer: false,
    users,
  });
});
export default router;
