import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import OwnerModel from "@/model/Owner";
import jwt from "jsonwebtoken";

export const authOptions = {
  providers: [
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

          return user;
        } catch (err) {
          throw new Error(err.message);
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token._id = user._id?.toString();
        token.isVerified = user.isVerified;
        token.email = user.email;
        token.organizationName = user.organizationName;
        token.username = user.username;

        // Set initial tokens
        token.accessToken = generateAccessToken(user);
        token.refreshToken = generateRefreshToken(user);
        token.accessTokenExpiry = Date.now() + 15 * 60 * 1000; // 20 seconds
        token.refreshTokenExpiry = Date.now() + 10 * 24 * 60 * 60 * 1000; // 60 seconds
      }

      // Handle token refresh
      if (Date.now() < token.refreshTokenExpiry) {
        if (Date.now() > token.accessTokenExpiry) {
          // Refresh access token
          token.accessToken = generateAccessToken({
            _id: token._id,
            email: token.email,
            username: token.username,
            isVerified: token.isVerified,
            organizationName: token.organizationName,
          });
          token.accessTokenExpiry = Date.now() + 15 * 60 * 1000;
          token.refreshToken = generateRefreshToken({
            _id: token._id,
            email: token.email,
            username: token.username,
            isVerified: token.isVerified,
            organizationName: token.organizationName,
          });
          token.refreshTokenExpiry = Date.now() + 10 * 24 * 60 * 60 * 1000;
        }
      } else {
        // Both tokens expired, return null to force logout
        return null;
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.email = token.email;
        session.user.organizationName = token.organizationName;
        session.user.username = token.username;
        session.accessToken = token.accessToken;
        session.refreshToken = token.refreshToken;
        session.accessTokenExpiry = token.accessTokenExpiry;
        session.refreshTokenExpiry = token.refreshTokenExpiry;
      }
      return session;
    },
  },

  pages: {
    signIn: "/sign-in",
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
    process.env.NEXTAUTH_SECRET,
    { expiresIn: "15m" }
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
    process.env.NEXTAUTH_SECRET,
    { expiresIn: "10d" }
  );
}
