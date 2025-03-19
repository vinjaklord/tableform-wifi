import mongoose from "mongoose";

const Schema = mongoose.Schema;

const dataSchema = new Schema(
  {
    date: { type: String, required: true },
    type: { type: String, required: true },
    text: { type: String, required: true },
    amount: { type: String, required: true },
  },
  { timestamps: true }
);

export const Data = mongoose.model("Data", dataSchema);
