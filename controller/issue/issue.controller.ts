import { Response, NextFunction, Request } from "express";
import IssueService from "./issue.service";
import { logger } from "../../shared/logger";
import ExcelJS from "exceljs";
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
    logger.info(`${userDetails} ===userDetails=== controller`);
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
    logger.info(`${user}, "===user=== controller", ${query}`);

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

    logger.info(`getAllIssuesList limit ${limit} pageNumber${pageNumber}`);

    const response: any = await issueService.getAllIssuesList({
      limit: limit,
      pageNumber: pageNumber,
    });

    logger.info(`getAllIssuesList response ${JSON.stringify(response)}`);

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

  async getAllIssuesExcel(_req: Request, res: Response, _next: NextFunction) {
    try {
      // Fetch the issues data from MongoDB
      const issues = await Issue.find({});

      issues.forEach(async (issue) => {
        // Assuming 'created_at' is the "From Date"
        const fromDate = new Date(issue?.created_at!);
        const tillDate = new Date(); // Today's date (Till Date)
        const formattedFromDate = fromDate.toLocaleDateString("en-GB");
        const formattedTillDate = tillDate.toLocaleDateString("en-GB");
        const dateRange = `${formattedFromDate} to ${formattedTillDate}`;

        // Create a new workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Issues");

        // Define columns for the worksheet
        worksheet.columns = [
          { header: "S no", key: "s_no" },
          { header: "Issues Till", key: "issues_till" },
          { header: "Item", key: "item" },
          { header: "Transaction ID", key: "transaction_id" },
          { header: "Network ID", key: "network_id" },
          { header: "Category", key: "category" },
          { header: "Sub Category", key: "sub_category" },
          { header: "BPP ID", key: "bppId" },
          { header: "BPP URI", key: "bpp_uri" },
          { header: "Domain", key: "domain" },
          { header: "Complainant Name", key: "complainant_name" },
          { header: "Complainant Phone", key: "complainant_phone" },
          { header: "Order ID", key: "orderId" },
          { header: "Order Details", key: "order_details" },
          { header: "Description", key: "description" },
          { header: "Issue Status", key: "issue_status" },
          { header: "Created At", key: "created_at" },
          { header: "Updated At", key: "updated_at" },
          { header: "Short Description", key: "short_desc" },
          { header: "Long Description", key: "long_desc" },
          { header: "Owner", key: "owner" },
          { header: "Group", key: "group" },
          {
            header: "Additional Details Content Type",
            key: "additional_desc.content_type",
          },
          { header: "Images", key: "images" },

          // Adding the new columns
          { header: "Ticket #", key: "ticket_no" },
          { header: "Assignee", key: "assignee" },

          { header: "Network Issue ID", key: "network_issue_id" },
          { header: "Issue Sub Category", key: "issue_sub_category" },
          { header: "Issue Sub Category Desc", key: "issue_sub_category_desc" },
          { header: "Network Order ID", key: "network_order_id" },
          { header: "Network Item ID", key: "network_item_id" },
        ];

        // Map the fetched data into the format needed for the Excel file
        const rows = issues.map((issue, index) => {
          return {
            s_no: index + 1, // Serial number
            userId: issue.userId,
            transaction_id: issue.transaction_id,
            message_id: issue.message_id,
            category: issue.category,
            sub_category: issue.sub_category,
            bppId: issue.bppId,
            bpp_uri: issue.bpp_uri,
            domain: issue.domain,
            complainant_name: issue.complainant_info?.person?.name || "",
            complainant_phone: issue.complainant_info?.contact?.phone || "",
            // complainant_email: issue.complainant_info?.contact?.email || '',
            orderId: issue.orderId,
            order_details: JSON.stringify(issue.order_details), // Serialize complex objects
            description: JSON.stringify(issue.description), // Serialize complex objects

            description_short: issue.description?.short_desc || "",
            description_long: issue.description?.long_desc || "",
            description_additional:
              issue.description?.additional_desc?.url || "",
            issue_status: issue.issue_status,
            created_at: issue.created_at,
            updated_at: issue.updated_at,
            item: "Wheat",
          };
        });

        // Add rows to the worksheet
        worksheet.addRows(rows);
        worksheet.addRow({
          issues_till: dateRange,
          // To Date
        });

        // Set response headers for downloading the Excel file
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=issues.xlsx"
        );

        // Write the Excel file to the response
        await workbook.xlsx.write(res);
        res.end(); // End the response
      });
    } catch (error) {
      logger.error("Error generating Excel:", error);
      res.status(500).send("Error generating Excel file");
    }
  }
}

export default IssueController;
