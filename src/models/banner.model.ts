import mongoose, { Schema } from "mongoose";
import * as Yup from "yup";

const BANNER_MODEL_NAME = "Banner";

export const bannerDAO = Yup.object({
  name: Yup.string().required(),
  image: Yup.string().required(),
  isShow: Yup.boolean().required(),
});

export type TypeBanner = Yup.InferType<typeof bannerDAO>;

interface IBanner extends TypeBanner {}

const BannerSchema = new Schema<IBanner>(
  {
    name: {
      type: Schema.Types.String,
      required: true,
    },
    image: {
      type: Schema.Types.String,
      required: true,
    },
    isShow: {
      type: Schema.Types.Boolean,
      required: true,
    },
  },
  { timestamps: true }
).index({ name: "text" });

const BannerModel = mongoose.model(BANNER_MODEL_NAME, BannerSchema);
export default BannerModel;
