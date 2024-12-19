import HttpRequest from "./httpRequest";
import PROTOCOL_API_URLS from "../shared/protocolRoutes";
import { IssueRequest } from "../interfaces/bpp_issue";
import { logger } from "../shared/logger";

/**
 * on Issue
 * @param {String} messageId
 */
const onIssue = async (messageId: string) => {
  const apiCall = new HttpRequest(
    process.env.PROTOCOL_BASE_URL,
    PROTOCOL_API_URLS.ON_ISSUE + "?messageId=" + messageId,
    "get"
  );

  const result = await apiCall.send();
  return result.data;
};

/**
 * Protocol Issue
 * @param {Object} data
 * @returns
 */
const protocolIssue = async (data: IssueRequest) => {
  const apiCall = new HttpRequest(
    process.env.PROTOCOL_BASE_URL,
    PROTOCOL_API_URLS.ISSUE,
    "POST",
    {
      ...data,
    }
  );

  const result = await apiCall.send();
  return result.data;
};
/**
 * Protocol Issue
 * @param {Object} data
 * @returns
 */
const protocolIssueStatus = async (data: any) => {
  logger.info("Issue status request payload", JSON.stringify(data));
  const apiCall = new HttpRequest(
    process.env.PROTOCOL_BASE_URL,
    PROTOCOL_API_URLS.ISSUE_STATUS,
    "POST",
    {
      ...data,
    }
  );

  const result = await apiCall.send();

  logger.info("IssueStatus seller response", JSON.stringify(result.data));
  return result.data;
};

/**
 * on order status
 * @param {String} messageId
 */
const onIssueStatus = async (messageId: string) => {
  const apiCall = new HttpRequest(
    process.env.PROTOCOL_BASE_URL,
    PROTOCOL_API_URLS.RESPONSE,
    "get",
    { requestType: "on_issue_status", messageId }
  );
  const result = await apiCall.send();

  logger.info(
    "OnIssueStats -> Seller response for On Issue status",
    JSON.stringify(result.data)
  );
  return result.data;
};

/**
 * on issue order
 * @param {String} messageId
 */
const onIssueOrder = async (messageId: string) => {
  const apiCall = new HttpRequest(
    process.env.PROTOCOL_BASE_URL,
    PROTOCOL_API_URLS.RESPONSE,
    "get",
    { requestType: "on_issue", messageId }
  );

  const result = await apiCall.send();
  logger.info(
    "onIssue -> Seller response for On Issue status",
    JSON.stringify(result.data)
  );
  return result.data;
};

/**
 * on issue_status
 * @param {String} messageId
 */
const onIssue_status = async (messageId: any) => {
  const apiCall = new HttpRequest(
    process.env.PROTOCOL_BASE_URL,
    PROTOCOL_API_URLS.RESPONSE,
    "get",
    { requestType: "on_issue_status", messageId }
  );

  const result = await apiCall.send();
  logger.info(
    "OnIssueStats -> Seller response for On Issue status",
    JSON.stringify(result.data)
  );
  return result.data;
};

export {
  protocolIssue,
  onIssue,
  protocolIssueStatus,
  onIssueStatus,
  onIssueOrder,
  onIssue_status,
};
