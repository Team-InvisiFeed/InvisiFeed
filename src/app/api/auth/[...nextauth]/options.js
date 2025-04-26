import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import OwnerModel from "@/models/Owner";
import jwt from "jsonwebtoken";
import { deleteOldInvoicePdfs } from "@/utils/deleteOldInvoicesFromCloudinary";
import sendVerificationEmail from "@/utils/sendVerificationEmail";
import DeletedAccountModel from "@/models/DeletedAccount";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await dbConnect();

        try {
          const user = await OwnerModel.findOne({
            $or: [
              { email: credentials.identifier },
              { username: credentials.identifier },
            ],
          });

          if (!user) {
            throw new Error("User not found with this email or username");
          }

          if (!user.isVerified) {
            const verifyCode = Math.floor(
              100000 + Math.random() * 900000
            ).toString();
            user.verifyCode = verifyCode;
            user.verifyCodeExpiry = new Date(Date.now() + 3600000); // 1 hour expiry
            await user.save();
            const emailResponse = await sendVerificationEmail(
              user.email,
              verifyCode
            );
            if (!emailResponse.success) {
              throw new Error(emailResponse.message);
            }
            throw new Error(`UNVERIFIED_USER:${user.username}`);
          }

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordCorrect) {
            throw new Error("Incorrect password");
          }

          // Delete old invoice PDFs (older than 15 minutes)
          await deleteOldInvoicePdfs(user.username);

          // Generate tokens
          const accessToken = generateAccessToken(user);
          const refreshToken = generateRefreshToken(user);

          const decodedAccessToken = jwt.decode(accessToken);
          const decodedRefreshToken = jwt.decode(refreshToken);

          // Store refresh token in database
          user.refreshToken = refreshToken;
          user.gstinDetails = {
            gstinVerificationStatus: false,
            gstinNumber: "",
            gstinVerificationResponse: null,
          };
          await user.save();

          return {
            ...user.toObject(),
            accessToken,
            refreshToken,
            accessTokenExpiry: decodedAccessToken.exp * 1000, // 20 seconds
            refreshTokenExpiry: decodedRefreshToken.exp * 1000, // 60 seconds
          };
        } catch (err) {
          throw new Error(err.message);
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await dbConnect();

        try {
          // Check if user exists
          const existingUser = await OwnerModel.findOne({ email: user.email });

          if (existingUser) {
            // ⚡ Check if user originally signed up with credentials
            if (!existingUser.isGoogleAuth) {
              return `/sign-in?error=DIFFERENT_SIGNIN_METHOD`;
            }

            // Delete old invoice PDFs (older than 15 minutes)
            await deleteOldInvoicePdfs(existingUser.username);

            // ✅ Allow sign-in if it's a valid Google user
            user.id = existingUser._id.toString();
            user.organizationName = existingUser.organizationName;
            user.username = existingUser.username;
            user.isProfileCompleted = existingUser.isProfileCompleted;
            user.phoneNumber = existingUser.phoneNumber;
            user.address = existingUser.address;
            user.gstinDetails = existingUser.gstinDetails;
            user.plan = existingUser.plan;
            user.proTrialUsed = existingUser.proTrialUsed;


            return true;
          }

          // 🔹 New Google Sign-up (Create user)
          const deletedAccount = await DeletedAccountModel.findOne({ email: user.email });
          if (deletedAccount && deletedAccount.deletionDate && (deletedAccount.deletionDate.getTime() + 15 * 24 * 60 * 60 * 1000) > new Date().getTime()) {
            const remainingMs = deletedAccount.deletionDate.getTime() + (15 * 24 * 60 * 60 * 1000) - new Date().getTime();
            const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
            return `/sign-in?error=ACCOUNT_DELETED&remainingDays=${remainingDays}`;
          }

          if(deletedAccount && deletedAccount.deletionDate && deletedAccount.deletionDate.getTime() + 15 * 24 * 60 * 60 * 1000 < new Date().getTime()){
            await DeletedAccountModel.findByIdAndDelete(deletedAccount._id);
          }

          const baseUsername = user.email.split("@")[0];
          let username = baseUsername;
          let counter = 1;

          while (await OwnerModel.findOne({ username })) {
            username = `${baseUsername}${counter}`;
            counter++;
          }

          const newUser = await OwnerModel.create({
            email: user.email,
            organizationName: user.name || "",
            username: username,
            password: await bcrypt.hash(Math.random().toString(36), 10),
            verifyCode: "GOOGLE_AUTH",
            verifyCodeExpiry: new Date(),
            isVerified: true,
            gstinDetails: {
              gstinVerificationStatus: false,
              gstinNumber: "",
              gstinVerificationResponse: null,
            },
            isGoogleAuth: true,
            isProfileCompleted: "pending",
            phoneNumber: "",
            address: {
              localAddress: "",
              city: "",
              state: "",
              country: "",
              pincode: "",
            },
          });

          user.id = newUser._id.toString();
          user.username = username;
          user.organizationName = newUser.organizationName;
          user.isProfileCompleted = newUser.isProfileCompleted;
          user.phoneNumber = newUser.phoneNumber;
          user.address = newUser.address;
          user.gstinDetails = newUser.gstinDetails;
          user.plan = newUser.plan;
          user.proTrialUsed = newUser.proTrialUsed;
          return true;
        } catch (error) {
          console.error("Google Sign-In Error:", error);
          return `/sign-in`;
        }
      }

      return true;
    },

    async jwt({ token, user, account, profile, session, trigger }) {
      if (user && account) {
        // Initial sign in
        token.id = user.id;
        token.provider = account.provider;
        token.username = user.username;
        token.gstinDetails = user.gstinDetails;
        token.organizationName = user.organizationName;
        token.isProfileCompleted = user.isProfileCompleted || "pending";
        token.phoneNumber = user.phoneNumber;
        token.address = user.address;
        token.plan = user.plan;
        token.proTrialUsed = user.proTrialUsed;

        if (account.provider === "google") {
          token.email = profile.email;
        } else {
          // Existing credentials logic
          token.accessToken = user.accessToken;
          token.refreshToken = user.refreshToken;
          token.accessTokenExpiry = user.accessTokenExpiry;
          token.refreshTokenExpiry = user.refreshTokenExpiry;

        }
      }

      // Check if plan has expired and update if needed
      if (token.plan?.planName === "pro" || token.plan?.planName === "pro-trial") {
        const now = new Date();
        if (new Date(token.plan.planEndDate) < now) {
          try {
            await dbConnect();
            const user = await OwnerModel.findById(token.id);
            if (user) {
              user.plan = {
                planName: "free",
                planStartDate: null,
                planEndDate: null,
              };
              await user.save();
              token.plan = user.plan;
            }
          } catch (error) {
            console.error("Error updating expired plan:", error);
          }
        }
      }

      // Handle session update
      if (trigger === "update" && session?.user) {
        token.isProfileCompleted = session.user.isProfileCompleted || "pending";
        token.organizationName = session.user.organizationName;
        token.gstinDetails = session.user.gstinDetails;
        token.phoneNumber = session.user.phoneNumber;
        token.address = session.user.address;
        token.plan = session.user.plan;
        token.proTrialUsed = session.user.proTrialUsed;
      }

      return token;
    },

    async session({ session, token, trigger }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.organizationName = token.organizationName;
        session.user.isProfileCompleted = token.isProfileCompleted || "pending";
        session.user.gstinDetails = token.gstinDetails;
        session.user.username = token.username;
        session.user.phoneNumber = token.phoneNumber;
        session.user.address = token.address;
        session.user.plan = token.plan;
        session.user.proTrialUsed = token.proTrialUsed;

        if (token.provider !== "google") {
          session.accessToken = token.accessToken;
          session.refreshToken = token.refreshToken;
          session.accessTokenExpiry = token.accessTokenExpiry;
          session.refreshTokenExpiry = token.refreshTokenExpiry;
        }
      }
      return session;
    },

    async redirect({ url, baseUrl, token }) {
      // If the url starts with /user, we need to append the username
      if (url.includes("/user")) {
        // If we have a token with username, use it
        if (token?.username) {
          return `${baseUrl}/user/${token.username}`;
        }

        // If we have a token with email, try to get username from database
        if (token?.email) {
          try {
            const user = await OwnerModel.findOne({ email: token.email });
            if (user?.username) {
              return `${baseUrl}/user/${user.username}`;
            }
          } catch (error) {
            console.error("Error getting username from database:", error);
          }
        }

        // If all else fails, redirect to /user
        return `${baseUrl}/user`;
      }

      // Default NextAuth redirect behavior
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  events: {
    async signOut({ token }) {
      try {
        await dbConnect();
        // Delete refresh token from database
        await OwnerModel.findByIdAndUpdate(token._id, {
          refreshToken: null,
        });
      } catch (error) {
        console.error("Error deleting refresh token:", error);
      }
    },
  },

  pages: {
    signIn: "/sign-in",
    error: "/sign-in", // Add error page redirect
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

// Helper functions to generate tokens
function generateAccessToken(user) {
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
      username: user.username,
      isVerified: user.isVerified,
      organizationName: user.organizationName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
      username: user.username,
      isVerified: user.isVerified,
      organizationName: user.organizationName,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
}
