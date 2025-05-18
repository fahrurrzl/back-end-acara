import { Request, Response, NextFunction } from "express";
import { getUserData } from "../utils/jwt";
import { IReqUser } from "../utils/interfaces";
import response from "../utils/response";

export default function (req: Request, res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return response.unauthorized(res);
  }

  const [prefix, token] = authorization.split(" ");

  if (!(prefix === "Bearer" && token)) {
    return response.unauthorized(res);
  }

  try {
    const user = getUserData(token);

    if (!user) {
      return response.unauthorized(res);
    }

    (req as IReqUser).user = user;

    next();
  } catch (error) {
    const err = error as unknown as Error;
    if (err.name === "TokenExpiredError") {
      return response.unauthorized(res, err, "Token expired");
    }

    return response.unauthorized(res, "Invalid token");
  }
}
