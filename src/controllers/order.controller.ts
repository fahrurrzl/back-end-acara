import { Response } from "express";
import { IReqUser } from "../utils/interfaces";
import response from "../utils/response";
import OrderModel, {
  OrderStatus,
  TOrder,
  TypeVoucher,
} from "../models/order.model";
import TicketModel from "../models/ticket.model";
import { FilterQuery } from "mongoose";
import { getId } from "../utils/id";

export default {
  async create(req: IReqUser, res: Response) {
    try {
      const userId = req?.user?.id;

      const payload = {
        ...req.body,
        createdBy: userId,
      } as TOrder;

      // cek ticket
      const ticket = await TicketModel.findById(payload.ticket);
      if (!ticket) return response.notFound(res, "ticket not found");
      if (ticket.quantity < +payload.quantity) {
        return response.error(res, null, "ticket quantity is not enough");
      }

      const total: number = +ticket?.price * +payload.quantity;

      Object.assign(payload, {
        ...payload,
        total,
      });

      const result = await OrderModel.create(payload);

      response.success(res, result, "success create an order");
    } catch (error) {
      response.error(res, error, "failed create an order");
    }
  },
  async findAll(req: IReqUser, res: Response) {
    try {
      const buildQuery = (filter: any) => {
        let query: FilterQuery<TOrder> = {};

        if (query.search) query.$text = { $search: filter.search };

        return query;
      };

      const { limit = 8, page = 1, search } = req.query;

      const query = buildQuery({
        search,
      });

      const result = await OrderModel.find(query)
        .limit(+limit)
        .skip((+page - 1) * +limit)
        .sort({ createdAt: -1 })
        .lean()
        .exec();
      const count = await OrderModel.countDocuments(query);

      response.pagination(
        res,
        result,
        {
          total: count,
          totalPage: Math.ceil(count / +limit),
          current: +page,
        },
        "success fetch all order"
      );
    } catch (error) {
      response.error(res, error, "failed fetch all order");
    }
  },
  async findOne(req: IReqUser, res: Response) {
    try {
      const { orderId } = req.params;
      const result = await OrderModel.findOne({ orderId });

      if (!result) return response.notFound(res, "order not found");

      response.success(res, result, "success to find one an order");
    } catch (error) {
      response.error(res, error, "failed to find one an order");
    }
  },

  async complete(req: IReqUser, res: Response) {
    try {
      const { orderId } = req.params;
      const userId = req.user?.id;

      const order = await OrderModel.findOne({
        orderId,
        createdBy: userId,
      });

      if (!order) return response.notFound(res, "order not found");

      if (order.status === OrderStatus.COMPLETED)
        return response.error(res, null, "you have been completed this order");

      const vouchers: TypeVoucher[] = Array.from(
        { length: order.quantity },
        () => {
          return {
            isPrint: false,
            voucherId: getId(),
          } as TypeVoucher;
        }
      );

      const result = await OrderModel.findOneAndUpdate(
        {
          orderId,
          createdBy: userId,
        },
        {
          vouchers,
          status: OrderStatus.COMPLETED,
        },
        { new: true }
      );

      const ticket = await TicketModel.findOne(order.ticket);
      if (!ticket) return response.notFound(res, "ticket and order not found");

      await TicketModel.updateOne(
        {
          _id: ticket._id,
        },
        {
          quantity: ticket.quantity - order.quantity,
        }
      );

      response.success(res, result, "success to complete an order");
    } catch (error) {
      response.error(res, error, "failed to complete an order");
    }
  },
  async remove(req: IReqUser, res: Response) {
    try {
      const { orderId } = req.params;

      const result = await OrderModel.findOneAndDelete(
        { orderId },
        { new: true }
      );

      if (!result) return response.notFound(res, "order not found");

      response.success(res, result, "success to remove an order");
    } catch (error) {
      response.error(res, error, "failed to remove an order");
    }
  },

  async pending(req: IReqUser, res: Response) {
    try {
      const { orderId } = req.params;

      const order = await OrderModel.findOne({
        orderId,
      });

      if (!order) return response.notFound(res, "order not found");

      if (order.status === OrderStatus.COMPLETED)
        return response.error(res, null, "you have been completed this order");

      if (order.status === OrderStatus.PENDING)
        return response.error(
          res,
          null,
          "this order currently in payment pending"
        );

      const result = await OrderModel.findOneAndUpdate(
        {
          orderId,
        },
        {
          status: OrderStatus.PENDING,
        },
        { new: true }
      );

      response.success(res, result, "success to pending an order");
    } catch (error) {
      response.error(res, error, "failed to pending an order");
    }
  },
  async cancelled(req: IReqUser, res: Response) {
    try {
      const { orderId } = req.params;

      const order = await OrderModel.findOne({
        orderId,
      });

      if (!order) return response.notFound(res, "order not found");

      if (order.status === OrderStatus.CANCELLED)
        return response.error(res, null, "this order has been cancelled");

      if (order.status === OrderStatus.COMPLETED)
        return response.error(res, null, "you have been completed this order");

      const result = await OrderModel.findOneAndUpdate(
        {
          orderId,
        },
        {
          status: OrderStatus.CANCELLED,
        },
        {
          new: true,
        }
      );

      response.success(res, result, "success to cancelled an order");
    } catch (error) {
      response.error(res, error, "failed to cancelled an order");
    }
  },
  async findAllByMember(req: IReqUser, res: Response) {
    try {
      const { limit = 8, page = 1 } = req.query;

      const result = await OrderModel.find({ createdBy: req.user?.id })
        .limit(+limit)
        .skip((+page - 1) * +limit)
        .sort({ createdAt: -1 })
        .lean()
        .exec();
      response.success(res, result, "success find all order by member");
    } catch (error) {
      response.error(res, error, "failed find all order by member");
    }
  },
};
