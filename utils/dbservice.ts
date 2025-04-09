import IssueModel from "../database/issue.model";
import { logger } from "../shared/logger";

/**
 * @param {String} transactionId
 * @param {Object} issueSchema
 */
const addOrUpdateIssueWithtransactionId = async (
  transactionId: string | any,
  issueSchema: Record<any, any> = {}
) => {
  try {
    console.log("🚀 ~ issueSchema:", JSON.stringify(issueSchema));

    const updatedIssue = await IssueModel.findOneAndUpdate(
      {
        transaction_id: transactionId,
        issueId: issueSchema.issueId,
      },
      {
        ...issueSchema,
      },
      { upsert: true }
    );

    return updatedIssue;
  } catch (error) {
    console.error("Error while updating or adding issue:", error);
    throw new Error("Failed to add or update the issue.");
  }
};

// const addOrUpdateIssueWithIssueId = async (
//   issueid: string | any,
//   respondent_actions: string | any,
//   issueSchema: Record<any, any> = {}
// ) => {
//   return await IssueModel.findOneAndUpdate(
//     {
//       issueId: issueid,
//       respondentActions : respondent_actions
//     },
//     {
//       ...issueSchema,
//     },
//     { upsert: true }
//   );
// };

const getIssueByTransactionId = async (transactionId: string) => {
  const issue: any = await IssueModel.find({
    transaction_id: transactionId,
  });

  if (!(issue || issue.length)) {
    return {
      status: 404,
      name: "NO_RECORD_FOUND_ERROR",
      message: "Record not found",
    };
  } else return issue?.[0];
};

const getIssueByOrderId = async (orderId: string) => {
  const issue: any = await IssueModel.find({
    "order_details.id": orderId,
  });

  if (!(issue || issue.length)) {
    logger.info(`db services returning response 404: getIssueByOrderId `);
    return {
      status: 404,
      name: "NO_RECORD_FOUND_ERROR",
      message: "Record not found",
    };
  } else logger.info(`db services returning response: getIssueByOrderId `);
  return {
    issues: issue,
    issueCount: issue.length,
  };
};

export {
  addOrUpdateIssueWithtransactionId,
  getIssueByTransactionId,
  getIssueByOrderId,
  // addOrUpdateIssueWithIssueId,
};
