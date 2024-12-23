import { Response, Request, NextFunction } from "express";
import IssueService from "./issue.service";
import { logger } from "../../shared/logger";

const issueService = new IssueService();
class IssueController {
  /**
   * create issue
   * @param {*} req    HTTP request object
   * @param {*} res    HTTP response object
   * @param {*} next   Callback argument to the middleware function
   */

  createIssue(req: any, res: Response, next: NextFunction) {
    const { body: request, user: userDetails } = req;
    logger.info(`${userDetails} ===userDetails=== controller`);
    issueService
      .createIssue(request, userDetails)
      .then((response) => {
        res.json(response);
      })
      .catch((err) => {
        next(err);
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

  getAllIssuesList(req: Request, res: Response, next: NextFunction) {
    try {
      const secret = req.body?.secret;
      console.log(
        "🚀 ~ file: issue.controller.ts:112 ~ IssueController ~ getAllIssuesList ~ secret:",
        secret
      );

      if (!secret || secret !== "123456") {
        console.log(
          "🚀 ~ file: issue.controller.ts:115 ~ IssueController ~ getAllIssuesList ~ secret:",
          secret
        );
        return res.status(400).send({ message: "Request secret is invalid" });
      }

      console.log(
        "🚀 ~ file: issue.controller.ts:146 ~ IssueController ~ getAllIssuesList ~ issueService:",
        issueService
      );

      issueService
        .getAllIssuesList()
        .then((response: any) => {
          console.log(
            "🚀 ~ file: issue.controller.ts:120 ~ IssueController ~ .then ~ response:",
            JSON.stringify(response)
          );
          if (!response.error) {
            console.log(
              "🚀 ~ file: issue.controller.ts:121 ~ IssueController ~ .then ~ response.error:",
              JSON.stringify(response.error)
            );
            return res.status(200).send({ ...response });
          } else {
            return res.status(200).send({
              totalCount: 0,
              issues: [],
              error: response.error,
            });
          }
        })
        .catch((err: any) => {
          console.log(
            "🚀 ~ file: issue.controller.ts:152 ~ IssueController ~ getAllIssuesList ~ err:",
            err
          );
          return next(err);
        });
    } catch (error) {
      return next(error);
    }
  }
}

export default IssueController;
