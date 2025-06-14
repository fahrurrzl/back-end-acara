import { Response } from "express";
import { IPaginationQuery, IReqUser } from "../utils/interfaces";
import response from "../utils/response";
import CategoryModel, { categoryDAO } from "../models/category.model";
import { isValidObjectId } from "mongoose";
import uploader from "../utils/uploader";

export default {
  async create(req: IReqUser, res: Response) {
    try {
      await categoryDAO.validate(req.body);
      const result = await CategoryModel.create(req.body);
      response.success(res, result, "success create a category");
    } catch (error) {
      response.error(res, error, "failed create category");
    }
  },
  async findAll(req: IReqUser, res: Response) {
    const {
      page = 1,
      limit = 10,
      search,
    } = req.query as unknown as IPaginationQuery;

    try {
      const query = {};

      if (search) {
        Object.assign(query, {
          $or: [
            {
              name: { $regex: search, $options: "i" },
            },
            {
              description: { $regex: search, $options: "i" },
            },
          ],
        });
      }

      const result = await CategoryModel.find(query)
        .limit(limit)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 })
        .exec();

      const count = await CategoryModel.countDocuments(query);

      response.pagination(
        res,
        result,
        {
          total: count,
          totalPage: Math.ceil(count / limit),
          current: page,
        },
        "success find all category"
      );
    } catch (error) {
      response.error(res, error, "failed find all category");
    }
  },
  async findOne(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return response.notFound(res, "filed find one a category");
      }

      const result = await CategoryModel.findById(id);

      if (!result) {
        return response.notFound(res, "filed find one a category");
      }

      response.success(res, result, "success find one category");
    } catch (error) {
      response.error(res, error, "failed find one category");
    }
  },
  async update(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;

      const result = await CategoryModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      if (!result) return response.notFound(res, "category not found");

      response.success(res, result, "success update category");
    } catch (error) {
      response.error(res, error, "failed update category");
    }
  },
  async remove(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;
      const result = await CategoryModel.findByIdAndDelete(id, { new: true });

      if (!result) return response.notFound(res, "category not found");

      await uploader.remove(result.icon);

      response.success(res, result, "success remove category");
    } catch (error) {
      response.error(res, error, "failed remove category");
    }
  },
};
