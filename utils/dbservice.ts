import IssueModel from "../database/issue.model";

/**
 * @param {String} transactionId
 * @param {Object} issueSchema
 */
const addOrUpdateIssueWithtransactionId = async (
  transactionId: string | any,
  issueid : string | any,
  issueSchema: Record<any, any> = {}
) => {
  return await IssueModel.findOneAndUpdate(
    {
      transaction_id: transactionId,
      issueId: issueid
    },
    {
      ...issueSchema,
    },
    { upsert: true }
  );
};
const addOrUpdateIssueWithIssueId = async (
  transactionId: string | any,
  subcategory: string |any,
  issueid : string | any,
  issueSchema: Record<any, any> = {}
) => {
  return await IssueModel.findOneAndUpdate(
    {
      transaction_id: transactionId,
      sub_category: subcategory,
      issueId: issueid
    },
    {
      ...issueSchema,
    },
    { upsert: true }
  );
};

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
    return {
      status: 404,
      name: "NO_RECORD_FOUND_ERROR",
      message: "Record not found",
    };
  } else
    return {
      issues:issue,
      issueCount: issue.length,
    };
};

export {
  addOrUpdateIssueWithtransactionId,
  getIssueByTransactionId,
  getIssueByOrderId,
  addOrUpdateIssueWithIssueId
};
