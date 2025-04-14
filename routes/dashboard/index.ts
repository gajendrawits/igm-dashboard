import express from "express";
import checkSession from "../../middleware/dashboard";
import IssueController from "../../controller/issue/app.controller";
// import path from "path";
import {
  listUsers,
  createUser,
  updateUser,
  deleteUserByEmail,
  // searchUsersByEmail
} from "../../controller/user/app.controller";

const router = express.Router();

const issueController = new IssueController();

router.get("/", checkSession, async (req, res) => {
  const openIssues = await issueController.getAllIssuesList(req, "open");
  const openIssuesCount = openIssues.totalCount;
  const closedIssues = await issueController.getAllIssuesList(req, "close");
  const closedIssuesCount = closedIssues.totalCount;
  const openIssuesObj = JSON.stringify(openIssues);
  const closedIssuesObj = JSON.stringify(closedIssues);

  const lastMonthCounts =
    await issueController.issueService.getLastMonthIssuesCounts();

  const openIssuesPercentageChange =
    lastMonthCounts.openIssuesLastMonth === 0
      ? 0
      : (
          ((openIssuesCount - lastMonthCounts.openIssuesLastMonth) /
            lastMonthCounts.openIssuesLastMonth) *
          100
        ).toFixed(1);

  const closedIssuesPercentageChange =
    lastMonthCounts.closedIssuesLastMonth === 0
      ? 0
      : (
          ((closedIssuesCount - lastMonthCounts.closedIssuesLastMonth) /
            lastMonthCounts.closedIssuesLastMonth) *
          100
        ).toFixed(1);

  const categoryCounts =
    await issueController.issueService.getIssuesByCategory();
  const totalIssues = categoryCounts.reduce((sum, cat) => sum + cat.count, 0);

  res.render("index", {
    layout: "../layouts/dashboard",
    footer: true,
    openIssuesCount,
    closedIssuesCount,
    openIssuesObj,
    closedIssuesObj,
    openIssuesPercentageChange,
    closedIssuesPercentageChange,
    categoryCounts,
    totalIssues,
  });
});

router.get("/issue-open", async (req, res) => {
  const response = await issueController.getAllIssuesList(req, "open");
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
  const response = await issueController.getAllIssuesList(req, "close");
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

router.post("/issue-id", async (req, res) => {
  const response = await issueController.getIssue(req);
  const issues = JSON.stringify(response);
  const totalCount = response.totalCount;

  res.render("crud/products", {
    layout: "../layouts/dashboard",
    footer: false,
    issues,
    totalCount,
    issueType: " ",
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

export default router;
