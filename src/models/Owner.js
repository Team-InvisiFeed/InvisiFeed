import mongoose, { Schema } from "mongoose";


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

  gstinDetails: {
    gstinNumber: {
      type: String,
      required: false,
      default: "",
    },
    gstinHolderName: {
      type: String,
      required: false,
      default: "",
    },
    gstinVerificationStatus: {
      type: Boolean,
      default: false,
    },
  },

  verifyCodeExpiry: {
    type: Date,
    required: [true, "Verify code expiry is required"],
  },

  isVerified: {
    type: Boolean,
    default: false,
  },

  isGoogleAuth: {
    type: Boolean,
    default: false,
  },

  isProfileCompleted: {
    type: String,
    enum: ["pending", "skipped", "completed"],
    default: "pending",
  },

  refreshToken: {
    type: String,
    default: null,
  },

  resetToken: {
    type: String,
    default: null,
  },

  resetTokenExpiry: {
    type: Date,
    default: null,
  },

  phoneNumber: {
    type: String,
    required: false,
    default: "",
    trim:true
  },

  address: {
    localAddress: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    city: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    state: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    country: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    pincode: {
      type: String,
      required: false,
      default: "",
    },
  },

  feedbacks: [{
    type: Schema.Types.ObjectId,
    ref: "Feedback",
  }],

  uploadedInvoiceCount: {
    count: {
      type: Number,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    dailyUploads: {
      type: Number,
      default: 0,
    },
    lastDailyReset: {
      type: Date,
      default: Date.now,
    },
  },

  currentRecommendedActions: {
    improvements: {
      type: [String],
      default: [],
    },
    strengths: {
      type: [String],
      default: [],
    },
  },
});

const OwnerModel =
  mongoose.models.Owner || mongoose.model("Owner", OwnerSchema);

export default OwnerModel;
