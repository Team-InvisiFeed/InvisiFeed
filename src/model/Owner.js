import mongoose, { Schema } from "mongoose";

const FeedbackSchema = new Schema({
  satisfactionRating: {
    type: Number,
    required: true,
  },
  communicationRating: {
    type: Number,
    required: true,
  },
  qualityOfServiceRating: {
    type: Number,
    required: true,
  },
  valueForMoneyRating: {
    type: Number,
    required: true,
  },
  recommendRating: {
    type: Number,
    required: true,
  },
  overAllRating: {
    type: Number,
    required: true,
  },
  feedbackContent: {
    type: String,
  },
  suggestionContent: {
    type: String,
  },

  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

const AddressSchema = new Schema({
  localAddress: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    required: true,
    trim: true,
  },
  pincode: {
    type: String,
    required: true,
  },
});

const InvoiceSchema = new Schema({
  invoiceId: {
    type: String,
    required: true,
    unique: true,
  },
  AIuseCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isFeedbackSubmitted: {
    type: Boolean,
    default: false,
  },
});

const OwnerSchema = new Schema({
  organizationName: {
    type: String,
    required: [true, "Organization Name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    match: [/.+\@.+\..+/, "Please use a valid email address"],
  },
  username: {
    type: String,
    required: [true, "Username is required"],
    trim: true,
    unique: true,
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
  phoneNumber: {
    type: String,
    required: [true, "Phone Number is required"],
  },
  address: {
    type: AddressSchema,
    required: [true, "Address is required"],
  },
  feedbacks: [FeedbackSchema],
  invoices: [InvoiceSchema],
});

const OwnerModel =
  mongoose.models.Owner || mongoose.model("Owner", OwnerSchema);

export default OwnerModel;
