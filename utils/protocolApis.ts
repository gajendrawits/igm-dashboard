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
  try {
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
  } catch (e) {
    logger.error(`Error while making issue request to seller: ${e}`);
    return null; // Ensure the function always returns something
  }
};
/**
 * Protocol Issue
 * @param {Object} data
 * @returns
 */
const protocolIssueStatus = async (data: any) => {
  logger.info("Fetching Issue status request from protocolIssueStatus", JSON.stringify(data));
  const apiCall = new HttpRequest(
    process.env.PROTOCOL_BASE_URL,
    PROTOCOL_API_URLS.ISSUE_STATUS,
    "POST",
    {
      ...data,
    }
  );

  const result = await apiCall.send();

  logger.info("Posting IssueStatus from protocol_Base_Url", JSON.stringify(result.data));
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
    "OnIssueStatus ->  On_Issue_Status response from seller",
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
    "onIssueOrder -> On_issue Order response from seller ",
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
    "OnIssueStats -> Getting On_Issue_Status Response from seller",
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
