import express from "express";
import checkSession from "../../middleware/dashboard";
import IssueController from "../../controller/issue/app.controller";
// import path from "path";

const router = express.Router();

const issueController= new IssueController()

router.get("/", checkSession, async (req, res) => {
  const openIssues = await issueController.getAllIssuesList(req, 'open');
  const openIssuesCount = openIssues.totalCount;
  const closedIssues = await issueController.getAllIssuesList(req, 'close');
  const closedIssuesCount = closedIssues.totalCount;
  const openIssuesObj = JSON.stringify(openIssues);
  const closedIssuesObj = JSON.stringify(closedIssues);

  res.render("index", {
    layout: "../layouts/dashboard",
    footer: true,
    openIssuesCount,
    closedIssuesCount,
    openIssuesObj,
    closedIssuesObj,
  });
});

router.get("/issue-open", async (req, res) => {
  const response = await issueController.getAllIssuesList(req, 'open');
  const issues = JSON.stringify(response);
  const totalCount = response.totalCount;

  res.render("crud/products", {
    layout: "../layouts/dashboard",
    footer: false,
    issues,
    totalCount,
    issueType: "open",
    currentPage: req.query.pageNumber || 1,
    limit: req.query.limit || 7,
  });
});

router.get("/issue-closed", async (req, res) => {
  const response = await issueController.getAllIssuesList(req, 'close');
  const issues = JSON.stringify(response);
  const totalCount = response.totalCount;

  res.render("crud/products", {
    layout: "../layouts/dashboard",
    footer: false,
    issues,
    totalCount,
    issueType: "close",
    currentPage: req.query.pageNumber || 1,
    limit: req.query.limit || 7,
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
