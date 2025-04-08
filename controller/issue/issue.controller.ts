import { Response, NextFunction, Request } from "express";
import IssueService from "./issue.service";
import { logger } from "../../shared/logger";
import ExcelJS from "exceljs";
import HttpRequest from "../../utils/httpRequest";
import PROTOCOL_API_URLS from "../../shared/protocolRoutes";
import cron from "node-cron";
import { MongoClient, Document } from "mongodb";
import Issue from "../../database/issue.model";
const issueService = new IssueService();

class IssueController {
  /**
   * create issue
   * @param {*} req    HTTP request object
   * @param {*} res    HTTP response object
   * @param {*} next   Callback argument to the middleware function
   */

  createIssue(req: any, res: Response) {
    const { body: request, user: userDetails } = req;
    logger.info(
      `Got Request From Client: createIssue (controllers) ${request}}`
    );
    issueService
      .createIssue(request, userDetails)
      .then((response) => {
        res.json(response);
      })
      .catch((_err) => {
        res.status(200).json(_err);
      });
  }

  /**
   * get issues list
   * @param {*} req    HTTP request object
   * @param {*} res    HTTP response object
   * @param {*} next   Callback argument to the middleware function
   */
  getIssuesList(req: any, res: Response, next: NextFunction) {
    const { query = {}, user } = req;
    logger.info(`GetIssueList API - user: ${user}, controller: ${query}`);

    issueService
      .getIssuesList(user, query)
      .then((response: any) => {
        if (!response.error) {
          res.json({ ...response });
        } else
          res.status(200).json({
            totalCount: 0,
            issues: [],
            error: response.error,
          });
      })
      .catch((err: any) => {
        next(err);
      });
  }

  /**
   * get single issue by transaction id
   * @param {*} req    HTTP request object
   * @param {*} res    HTTP response object
   * @param {*} next   Callback argument to the middleware function
   */
  getIssue(req: any, res: Response, next: NextFunction) {
    const { query = {} } = req;
    logger.info(`getIssue controller function`);
    query?.transactionId
      ? issueService
          .getSingleIssue(query?.transactionId)
          .then((response: any) => {
            if (response.error) {
              res.json({
                error: response.error,
              });
            } else res.status(200).json(response.issue);
          })
          .catch((err: any) => {
            next(err);
          })
      : issueService
          .getIssueByOrderID(query?.orderId)
          .then((response: any) => {
            if (response.error) {
              res.json({
                error: response.error,
              });
            } else res.status(200).json(response.issue);
          })
          .catch((err: any) => {
            next(err);
          });
  }

  /**
   * on issue
   * @param {*} req    HTTP request object
   * @param {*} res    HTTP response object
   * @param {*} next   Callback argument to the middleware function
   */
  onIssue(req: any, res: Response, next: NextFunction) {
    const { query } = req;
    const { messageId } = query;

    issueService
      .onIssueOrder(messageId)
      .then((issue: any) => {
        res.json(issue);
      })
      .catch((err: any) => {
        next(err);
      });
  }

  async getAllIssuesList(req: Request, res: Response, _next: NextFunction) {
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const pageNumber = parseInt(req.query.pageNumber as string, 10) || 1;

    logger.info(
      `getAllIssueList API (Controllers):  Limit ${limit} pageNumber${pageNumber}`
    );

    const response: any = await issueService.getAllIssuesList({
      limit: limit,
      pageNumber: pageNumber,
    });

    logger.info(`getAllIssuesList response ${JSON.stringify(response)}`);
    logger.info(`getAllIssuesList response ${response}`);

    return res.status(200).send({
      data: response,
    });
  }
  // /**
  //  * All Issue Excel
  //  * @param {*} req    HTTP request object
  //  * @param {*} res    HTTP response object
  //  * @param {*} next   Callback argument to the middleware function
  //  */

  async getAllIssuesExcel(req: Request, res: Response, _next: NextFunction) {
    try {
      logger.info(`issue in excel: getAllIssuesExcel`);
      const { from, to } = req.query;

      // Validate that both 'from' and 'to' are present
      if (!from || !to) {
        return res
          .status(400)
          .send("Both 'from' and 'to' query parameters are required.");
      }

      const startDate = new Date(from?.toString() || "");
      const endDate = new Date(to?.toString() || "");

      // Fetch the issues data from MongoDB within the date range
      const issues = await Issue.aggregate([
        {
          $match: {
            $expr: {
              $and: [
                {
                  $gte: [
                    { $dateFromString: { dateString: "$created_at" } },
                    startDate,
                  ],
                },
                {
                  $lte: [
                    { $dateFromString: { dateString: "$created_at" } },
                    endDate,
                  ],
                },
              ],
            },
          },
        },
      ]);

      if (issues.length === 0) {
        return res
          .status(404)
          .send("No issues found in the specified date range !");
      }

      // Create a new workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Issues");

      // Define columns for the worksheet
      worksheet.columns = [
        { header: "S no", key: "s_no" },
        { header: "Ticket #", key: "ticket_no" },
        { header: "Item", key: "item" },
        { header: "Network ID", key: "network_id" },
        { header: "Category", key: "category" },
        { header: "Sub Category", key: "sub_category" },
        { header: "BPP ID", key: "bppId" },
        { header: "BPP URI", key: "bpp_uri" },
        { header: "Domain", key: "domain" },
        { header: "Complainant Name", key: "complainant_name" },
        { header: "Complainant Phone", key: "complainant_phone" },
        { header: "Order ID", key: "orderId" },
        { header: "Item Id", key: "item_id" },
        { header: "Issue Status", key: "issue_status" },
        { header: "Created At", key: "created_at" },
        { header: "Updated At", key: "updated_at" },
        { header: "Short Description", key: "short_desc" },
        { header: "Long Description", key: "long_desc" },
        { header: "url", key: "url" },
        { header: "Images", key: "images" },
        { header: "Owner", key: "owner" },
        { header: "Group", key: "group" },
        {
          header: "Additional Details Content Type",
          key: "additional_desc_content_type",
        },
        { header: "Assignee", key: "assignee" },
      ];

      // Prepare rows
      const rows = issues.map((issue, index) => {
        return {
          s_no: index + 1,
          transaction_id: issue.transaction_id,
          network_id: issue.transaction_id,
          category: issue.category,
          sub_category: issue.sub_category,
          bppId: issue.bppId,
          bpp_uri: issue.bpp_uri,
          domain: issue.domain,
          complainant_name: issue.complainant_info?.person?.name || "",
          complainant_phone: issue.complainant_info?.contact?.phone || "",
          orderId: issue?.order_details?.id,
          // order_details: JSON.stringify(issue.order_details), // Serialize complex objects
          item: issue?.order_details?.items[0]?.product?.descriptor?.name, // Serialize complex ob
          item_id: issue?.order_details?.items[0]?.product?.id, // Serialize complex objects
          // order_state: JSON.stringify(issue?.order_details?.state), // Serialize complex objects
          short_desc: issue.description?.short_desc || "",
          long_desc: issue.description?.long_desc || "",
          url: issue.description?.additional_desc?.url || "",
          Image: issue?.description?.image || "",
          issue_status: issue.issue_status,
          created_at: issue.created_at,
          updated_at: issue.updated_at,
          ticket_no: issue._id || "", // Example, if there's a ticket number
          assignee: issue.assignee || "",
          owner: issue.owner || "",
          group: issue.group || "",
          additional_desc_content_type:
            issue.additional_desc_content_type || "",
        };
      });

      // Add rows to the worksheet in bulk
      worksheet.addRows(rows);

      // Set response headers for downloading the Excel file
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=issues|" + from + "|" + to + ".xlsx"
      );

      // Write the Excel file to the response
      await workbook.xlsx.write(res);
      return res.end(); // End the response
    } catch (error) {
      logger.error("Error generating Excel:", error);
      return res.status(500).send("Error generating Excel file");
    }
  }
}
// /**
//  * Cron Job
//  * @param {*} req    HTTP request object
//  * @param {*} res    HTTP response object
//  * @param {*} next   Callback argument to the middleware function
//  */

//  Validate and safely assign env vars

const PROTOCOL_BASE_URL = process.env.PROTOCOL_BASE_URL as string;
const DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING as string;
const MONGO_DATABASE = process.env.MONGO_DATABASE as string;

// Validate environment variables
if (!PROTOCOL_BASE_URL || !DB_CONNECTION_STRING || !MONGO_DATABASE) {
  throw new Error("❌ Missing one or more required environment variables.");
}

// Utility function to add timeout to a promise
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  const timeout = new Promise<T>((_, reject) =>
    setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
  );
  return Promise.race([promise, timeout]);
}

// Function to get status for a given messageId using GET request
async function getStatus(messageId: string): Promise<string> {
  try {
    const apiCall = new HttpRequest(
      PROTOCOL_BASE_URL,
      `${PROTOCOL_API_URLS.ISSUE_STATUS}?messageId=${messageId}`,
      'get'
    );

    const response = await apiCall.send();
    const status = String(response.status ?? 'Unknown');
    console.log(`📡 [${messageId}] Status retrieved: ${status}`);
    return status;
  } catch (error: any) {
    console.error(`❌ [${messageId}] Failed to fetch status: ${error.message}`);
    return 'Error'; // Return 'Error' on failure or timeout
  }
}

// Cron job to fetch message IDs and check their status
async function fetchAndCheckStatus(): Promise<void> {
  let client: MongoClient | null = null;

  try {
    // Connect to MongoDB
    client = await MongoClient.connect(DB_CONNECTION_STRING);
    const db = client.db(MONGO_DATABASE);
    const collection = db.collection('issues');

    // Fetch all message_ids from the database
    const messageDocs: Document[] = await collection
      .find({ message_id: { $exists: true } }, { projection: { message_id: 1 } })
      .toArray();

    console.log(`📥 Retrieved ${messageDocs.length} message IDs from database`);

    if (messageDocs.length === 0) {
      console.log("📭 No message IDs found in database");
      return;
    }

    // Process each message ID sequentially, with timeout
    let processedCount = 0;
    for (const doc of messageDocs) {
      const messageId = doc.message_id;
      console.log(`🚀 [${processedCount + 1}/${messageDocs.length}] Processing message ID: ${messageId}`);

      // Wrap getStatus with a 5-second timeout (adjustable)
      const statusPromise = getStatus(messageId);
      const status = await withTimeout(
        statusPromise,
        5000, // 5 seconds timeout
        `Timeout: No response for ${messageId} after 5 seconds`
      ).catch((err) => {
        console.error(`⏳ [${messageId}] ${err.message}`);
        return 'Error'; // Treat timeout as an error and move on
      });

      console.log(`📋 [${messageId}] Issue Status: ${status}`);

      if (status === 'Error') {
        console.warn(`⚠️ [${messageId}] Status check failed or timed out, continuing to next message`);
      } else {
        console.log(`✅ [${messageId}] Successfully retrieved status: ${status}`);
      }

      processedCount++;
    }

    console.log(`🏁 Finished processing ${processedCount} message IDs`);

  } catch (err) {
    console.error('❌ Critical error in cron job (e.g., DB connection):', err);
    // Cron will retry on next run
  } finally {
    if (client) {
      try {
        await client.close();
        console.log('🔌 Database connection closed');
      } catch (closeErr) {
        console.error('❌ Error closing DB connection:', closeErr);
      }
    }
  }
}

// Schedule the cron job (every 5 seconds)
cron.schedule('*/5 * * * * *', () => {
  console.log('⏰ Cron job started at:', new Date().toISOString());
  fetchAndCheckStatus().catch((err) => {
    console.error('❌ Unhandled error in fetchAndCheckStatus:', err);
    // Prevents cron from stopping
  });
});

console.log('Cron job scheduler initialized');

export default IssueController;
