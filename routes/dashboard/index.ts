import express from "express";
import checkSession from "../../middleware/dashboard";
import IssueController from "../../controller/issue/app.controller";
// import path from "path";

const router = express.Router();

const issueController= new IssueController()

// POST route for user loginß

router.get("/", checkSession, (_req, res) => {
  res.render("index", {
    layout: "../layouts/dashboard",
    footer: true,
  });
});

router.get("/issue-open", async (req, res) => {
  const response = await issueController.getAllIssuesList(req);
  const issues = JSON.stringify(response)
  
  res.render("crud/products", {
    layout: "../layouts/dashboard",
    footer: false,
    issues,
    issueType: "open",
  });
});

router.get("/issue-closed", async (req, res) => {
  const response = await issueController.getAllIssuesList(req);
  const issues = JSON.stringify(response)

  res.render("crud/products", {
    layout: "../layouts/dashboard",
    footer: false,
    issues,
    issueType: "close",
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
