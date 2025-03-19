import { Request } from "express";
import { Types } from "mongoose";
import { User } from "../models/user.model";

export interface IUserToken
  extends Omit<
    User,
    | "password"
    | "activationCode"
    | "isActive"
    | "profilePicture"
    | "email"
    | "fullName"
    | "username"
  > {
  id?: Types.ObjectId;
}

export interface IReqUser extends Request {
  user?: IUserToken;
}
