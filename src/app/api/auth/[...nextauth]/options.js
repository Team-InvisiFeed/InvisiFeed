import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import OwnerModel from "@/model/Owner";
import jwt from "jsonwebtoken";
import { getSession } from "next-auth/react";

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
            throw new Error("User not found with this email");
          }

          if (!user.isVerified) {
            throw new Error("Please verify your account before login");
          }

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordCorrect) {
            throw new Error("Incorrect password");
          }

          // Generate tokens
          const accessToken = generateAccessToken(user);
          const refreshToken = generateRefreshToken(user);

          const decodedAccessToken = jwt.decode(
            accessToken,
            process.env.ACCESS_TOKEN_SECRET
          );
          const decodedRefreshToken = jwt.decode(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
          );

          // Store refresh token in database
          user.refreshToken = refreshToken;
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

            // ✅ Allow sign-in if it's a valid Google user
            user.id = existingUser._id.toString();
            user.username = existingUser.username;
            user.isProfileCompleted = existingUser.isProfileCompleted;
            return true;
          }

          // 🔹 New Google Sign-up (Create user)
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
            isGoogleAuth: true,
            isProfileCompleted: false,
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
          user.isProfileCompleted = newUser.isProfileCompleted;

          return true;
        } catch (error) {
          console.error("Google Sign-In Error:", error);
          return `/sign-in`; // 🔥 Redirect to error message
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

        if (account.provider === "google") {
          token.email = profile.email;
          token.organizationName = profile.name;
          token.isProfileCompleted = user.isProfileCompleted;
        } else {
          // Existing credentials logic
          token.accessToken = user.accessToken;
          token.refreshToken = user.refreshToken;
          token.organizationName = user.organizationName;
          token.phoneNumber = user.phoneNumber;
          token.address = user.address;
          token.accessTokenExpiry = user.accessTokenExpiry;
          token.refreshTokenExpiry = user.refreshTokenExpiry;
          token.isProfileCompleted = user.isProfileCompleted;
        }
      }

      // Handle token refresh
      if (token.provider !== "google" && token.refreshTokenExpiry) {
        if (Date.now() < token.refreshTokenExpiry) {
          if (Date.now() > token.accessTokenExpiry) {
            try {
              // Generate new tokens
              const newAccessToken = generateAccessToken({
                _id: token.id,
                email: token.email,
                username: token.username,
                isVerified: token.isVerified,
                organizationName: token.name,
              });
              const newRefreshToken = generateRefreshToken({
                _id: token.id,
                email: token.email,
                username: token.username,
                isVerified: token.isVerified,
                organizationName: token.name,
              });

              const decodedNewAccessToken = jwt.decode(
                newAccessToken,
                process.env.ACCESS_TOKEN_SECRET
              );
              const decodedNewRefreshToken = jwt.decode(
                newRefreshToken,
                process.env.REFRESH_TOKEN_SECRET
              );

              // Update refresh token in database
              await OwnerModel.findByIdAndUpdate(token.id, {
                refreshToken: newRefreshToken,
              });

              // Update token object
              token.accessToken = newAccessToken;
              token.refreshToken = newRefreshToken;
              token.accessTokenExpiry = decodedNewAccessToken.exp * 1000;
              token.refreshTokenExpiry = decodedNewRefreshToken.exp * 1000;
            } catch (error) {
              console.error("Error refreshing token:", error);
              return null;
            }
          }
        } else {
          return null;
        }
      }

      // Handle session update
      if (trigger === "update" && session?.user) {
        token.isProfileCompleted = session.user.isProfileCompleted;
        token.organizationName = session.user.organizationName;
        token.phoneNumber = session.user.phoneNumber;
        token.address = session.user.address;
      }

      return token;
    },

    async session({ session, token, trigger }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.organizationName = token.organizationName;
        session.user.isProfileCompleted = token.isProfileCompleted;
        session.user.username = token.username;
        session.user.phoneNumber = token.phoneNumber;
        session.user.address = token.address;

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
      // console.log("redirect callback url: ", url);
      // console.log("redirect callback baseUrl: ", baseUrl);
      // console.log("redirect callback token: ", token);
      if (url.includes("/user")) {
        const session = await getSession();
        // console.log("accha session: ", session);

        if (session?.user?.username) {
          return `${baseUrl}/user/${session.user.username}`;
        }
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
