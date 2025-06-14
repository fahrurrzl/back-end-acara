import mongoose, { Schema } from "mongoose";
import * as Yup from "yup";
import { EVENT_MODEL_NAME } from "./event.model";

export const TICKET_MODEL_NAME = "Ticket";

export const ticketDAO = Yup.object({
  price: Yup.number().required(),
  name: Yup.string().required(),
  events: Yup.string().required(),
  description: Yup.string().required(),
  quantity: Yup.number().required(),
});

export type TypeTicket = Yup.InferType<typeof ticketDAO>;

interface ITicket extends Omit<TypeTicket, "events"> {
  events: Schema.Types.ObjectId;
}

const TicketSchema = new Schema<ITicket>(
  {
    price: {
      type: Schema.Types.Number,
      required: true,
    },
    name: {
      type: Schema.Types.String,
      required: true,
    },
    events: {
      type: Schema.Types.ObjectId,
      ref: EVENT_MODEL_NAME,
    },
    description: {
      type: Schema.Types.String,
      required: true,
    },
    quantity: {
      type: Schema.Types.Number,
      required: true,
    },
  },
  { timestamps: true }
).index({ name: "text", description: "text" });

const TicketModel = mongoose.model(TICKET_MODEL_NAME, TicketSchema);
export default TicketModel;
