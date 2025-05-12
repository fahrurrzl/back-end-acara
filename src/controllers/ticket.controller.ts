import { Response } from "express";
import { IPaginationQuery, IReqUser } from "../utils/interfaces";
import TicketModel, { ticketDAO, TypeTicket } from "../models/ticket.model";
import response from "../utils/response";
import { FilterQuery, isValidObjectId } from "mongoose";

export default {
  async create(req: IReqUser, res: Response) {
    try {
      ticketDAO.validate(req.body);
      const result = await TicketModel.create(req.body);
      response.success(res, result, "success create a ticket");
    } catch (error) {
      response.error(res, error, "failed create a ticket");
    }
  },
  async findAll(req: IReqUser, res: Response) {
    try {
      const {
        limit = 8,
        page = 1,
        search,
      } = req.query as unknown as IPaginationQuery;

      const query: FilterQuery<TypeTicket> = {};

      if (search) {
        Object.assign(query, {
          ...query,
          $text: {
            $search: search,
          },
        });
      }

      const result = await TicketModel.find(query)
        .populate("events")
        .limit(limit)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 })
        .exec();

      const count = await TicketModel.countDocuments(query);

      response.pagination(
        res,
        result,
        {
          current: page,
          total: count,
          totalPage: Math.ceil(count / limit),
        },
        "success find all ticket"
      );
    } catch (error) {
      response.error(res, error, "failed find all ticket");
    }
  },
  async findOne(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;
      const result = await TicketModel.findById(id).populate("events");

      if (!result) {
        response.notFound(res, "filed find one a ticket");
      }

      response.success(res, result, "success find one ticket");
    } catch (error) {
      response.error(res, error, "failed find one ticket");
    }
  },
  async update(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;
      const result = await TicketModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      response.success(res, result, "success update ticket");
    } catch (error) {
      response.error(res, error, "failed update ticket");
    }
  },
  async remove(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;
      const result = await TicketModel.findByIdAndDelete(id, { new: true });
      response.success(res, result, "success remove ticket");
    } catch (error) {
      response.error(res, error, "failed remove ticket");
    }
  },
  async findAllByEvent(req: IReqUser, res: Response) {
    try {
      const { eventId } = req.params;

      if (!isValidObjectId(eventId)) {
        return response.error(res, null, "ticket not found");
      }

      const result = await TicketModel.find({ events: eventId }).exec();
      response.success(res, result, "success find all ticket by an event");
    } catch (error) {
      response.error(res, error, "failed find all ticket by an event");
    }
  },
};
