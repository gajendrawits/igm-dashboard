import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
// import loadEnvVariables from "./utils/envHelper";
import issueRoutes from "./routes/issue";
import issue_statusRoutes from "./routes/issue_status";
import authRoutes from "./routes/auth";
import dashboardRoutes from "./routes/dashboard";
import sseRoutes from "./routes/sse";
import dotenv from "dotenv";
import path from "path";
import expressLayouts from "express-ejs-layouts";
import session from "express-session";
import checkSession from "./middleware/dashboard";

const createServer = (): express.Application => {
  const app: Application = express();
  dotenv.config();

  // initialize environment variables
  // loadEnvVariables();
  // Body parsing Middleware
  app.use(express.json({ limit: "50mb" }));
  app.use(bodyParser.json());
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));
  app.use(cors());
  app.use(express.static(path.join(__dirname, "/static")));
  // Static Files
  app.use(express.static(path.join(__dirname, "/static")));
  app.use(
    session({
      secret: "your-secret-key", // Change this to a secure, unique key
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false }, // Set to true if using HTTPS
    })
  );
  // Set Templating Engine
  app
    .use(expressLayouts)
    .set("view engine", "ejs")
    .set("views", path.join(__dirname, "/content"));

  app.get("/", checkSession, (_req, res) => {
    res.render("index", {
      layout: path.join(__dirname, "/layouts/dashboard"),
      footer: true,
    });
  });
  app.use("/auth", authRoutes);
  app.use("/dashboard", dashboardRoutes);
  //Routes
  app.use("/issueApis", issueRoutes);
  app.use("/issueApis", issue_statusRoutes);
  app.use("/issueApis", sseRoutes);

  app.use("/images", express.static("images"));
  app.use("/issueApis/uploads", express.static("images"));

  // eslint-disable-next-line no-unused-vars
  app.get("/", async (_req: Request, res: Response): Promise<Response> => {
    return res.status(200).send({
      success: true,
      message: "The IGM service is running",
    });
  });

  // eslint-disable-next-line no-unused-vars
  app.get(
    "/health",
    async (_req: Request, res: Response): Promise<Response> => {
      return res.status(200).send({
        success: true,
        message: "The server is running",
      });
    }
  );

  return app;
};

export default createServer;
