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
        // { header: "issueId", key: "issueId" },
        { header: "respondent_actions", key: "respondent_actions" },
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
          respondent_actions: issue.respondent_actions,
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
          ticket_no: issue._id, // Example, if there's a ticket number
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

if (!PROTOCOL_BASE_URL || !DB_CONNECTION_STRING || !MONGO_DATABASE) {
  throw new Error(" Missing one or more required environment variables.");
}

//  Send POST request using HttpRequest class
async function getStatus(messageId: string): Promise<string> {
  try {
    const apiCall = new HttpRequest(
      PROTOCOL_BASE_URL,
      PROTOCOL_API_URLS.ISSUE_STATUS,
      "post",
      { messageId }
    );

    const response = await apiCall.send();
    console.log(` Status response for ${messageId}:`, response);

    return String(response.status ?? 'Unknown');
  } catch (error: any) {
    console.error(` Failed to fetch status for ${messageId}:`, error.message);
    return 'Error';
  }
}

//  Fetch message_ids from MongoDB and check their status
export async function fetchMessageIdsAndCheckStatus(): Promise<void> {
  let client: MongoClient | null = null;

  try {
    client = await MongoClient.connect(DB_CONNECTION_STRING);
    const db = client.db(MONGO_DATABASE);
    const collection = db.collection('issues');

    const results: Document[] = await collection
      .find({}, { projection: { message_id: 1 } })
      .toArray();

    const messageIds: string[] = results
      .map(doc => doc.message_id)
      .filter((id): id is string => typeof id === 'string');

    console.log(` Found ${messageIds.length} messageId(s):`, messageIds);

    for (const messageId of messageIds) {
      const status = await getStatus(messageId);

      if (status === 'Error' || status === 'Unknown') {
        console.warn(` Skipping ${messageId} due to invalid status.`);
        continue;
      }

      console.log(` Status for ${messageId}: ${status}`);
    }

  } catch (err) {
    console.error(' Cron job error:', err);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// ⏰ Run every 5 seconds
cron.schedule('*/5 * * * * *', () => {
  console.log('⏰ Cron job running at:', new Date().toISOString());
  fetchMessageIdsAndCheckStatus();
});

export default IssueController;
