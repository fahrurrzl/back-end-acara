import { Response } from "express";
import { IReqUser } from "../utils/interfaces";
import uploader from "../utils/uploader";
import response from "../utils/response";

export default {
  async single(req: IReqUser, res: Response) {
    if (!req.file) {
      response.error(res, null, "file is not exist");
    }

    try {
      const result = await uploader.uploadSingle(
        req.file as Express.Multer.File
      );

      response.success(res, result, "success upload file");
    } catch {
      response.error(res, null, "filed upload a file");
    }
  },
  async multiple(req: IReqUser, res: Response) {
    if (!req.files || req.files.length === 0) {
      response.error(res, null, "files is not exits");
    }

    try {
      const result = await uploader.uploadMultiple(
        req.files as Express.Multer.File[]
      );

      response.success(res, result, "success upload files");
    } catch {
      response.error(res, null, "filed upload files");
    }
  },
  async remove(req: IReqUser, res: Response) {
    const { fileUrl } = req.body as { fileUrl: string };

    try {
      const result = await uploader.remove(fileUrl);

      response.success(res, result, "success remove file");
    } catch {
      response.error(res, null, "failed remove file");
    }
  },
};
