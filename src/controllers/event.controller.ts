import { Response } from "express";
import { IPaginationQuery, IReqUser } from "../utils/interfaces";
import response from "../utils/response";
import EventModel, { eventDAO, TEvent } from "../models/event.model";
import { FilterQuery, isValidObjectId } from "mongoose";

export default {
  async create(req: IReqUser, res: Response) {
    try {
      const payload = { ...req.body, createdBy: req.user?.id } as TEvent;
      await eventDAO.validate(payload);
      const result = await EventModel.create(payload);
      response.success(res, result, "success create an event");
    } catch (error) {
      response.error(res, error, "failed create an event");
    }
  },
  async findAll(req: IReqUser, res: Response) {
    try {
      const buildQuery = (filter: any) => {
        let query: FilterQuery<TEvent> = {};

        if (filter.search) query.$text = { $search: filter.search };
        if (filter.category) query.category = filter.category;
        if (filter.isOnline) query.isOnline = filter.isOnline;
        if (filter.isPublish) query.isPublish = filter.isPublish;
        if (filter.isFeatured) query.isFeatured = filter.isFeatured;

        return query;
      };

      const {
        limit = 8,
        page = 1,
        search,
        category,
        isOnline,
        isFeatured,
        isPublish,
      } = req.query;

      const query = buildQuery({
        limit,
        page,
        search,
        category,
        isOnline,
        isFeatured,
        isPublish,
      });

      const result = await EventModel.find(query)
        .limit(+limit)
        .skip((+page - 1) * +limit)
        .sort({ createdAt: -1 })
        .lean()
        .exec();
      const count = await EventModel.countDocuments(query);

      response.pagination(
        res,
        result,
        {
          total: count,
          totalPage: Math.ceil(count / +limit),
          current: +page,
        },
        "success fetch all events"
      );
    } catch (error) {
      response.error(res, error, "failed fetch all events");
    }
  },
  async findOne(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return response.notFound(res, "filed find one a event");
      }

      const result = await EventModel.findById(id);

      if (!result) {
        return response.notFound(res, "filed find one a event");
      }

      response.success(res, result, "success find one event");
    } catch (error) {
      response.error(res, error, "failed find one event");
    }
  },
  async update(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;

      const result = await EventModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      response.success(res, result, "success update an event");
    } catch (error) {
      response.error(res, error, "failed update an event");
    }
  },
  async remove(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;

      const result = await EventModel.findByIdAndDelete(id, { new: true });
      response.success(res, result, "success remove and event");
    } catch (error) {
      response.error(res, error, "failed remove an event");
    }
  },
  async findOneBySlug(req: IReqUser, res: Response) {
    try {
      const { slug } = req.params;

      const result = await EventModel.findOne({ slug });
      response.success(res, result, "success find one by slug");
    } catch (error) {
      response.error(res, error, "failed find one by slug");
    }
  },
};
