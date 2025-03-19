import mongoose, { Schema, Document } from "mongoose";

const FeedbackSchema = new Schema({
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  ratings: {
    type: Number,
  },
});

const OwnerSchema = new Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    match: [/.+\@.+\..+/, "Please use a valid email address"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  verifyCode: {
    type: String,
    required: [true, "Verify code is required"],
  },
  verifyCodeExpiry: {
    type: Date,
    required: [true, "Verify code expiry is required"],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  feedbacks: [FeedbackSchema],
  orderIds: {
    type: [
      {
        orderId: { type: String, required: true },
        frequency: { type: Number, default: 0 },
      },
    ],
    default: [],
  },
});

const OwnerModel =
  mongoose.models.Owner || mongoose.model("Owner", OwnerSchema);

export default OwnerModel;
