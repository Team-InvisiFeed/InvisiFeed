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

          // Generate tokens
          const accessToken = generateAccessToken(user);
          const refreshToken = generateRefreshToken(user);

          const decodedAccessToken = jwt.decode(accessToken, process.env.ACCESS_TOKEN_SECRET);
          const decodedRefreshToken = jwt.decode(refreshToken, process.env.REFRESH_TOKEN_SECRET);

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
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token._id = user._id?.toString();
        token.isVerified = user.isVerified;
        token.email = user.email;
        token.organizationName = user.organizationName;
        token.username = user.username;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessTokenExpiry = user.accessTokenExpiry;
        token.refreshTokenExpiry = user.refreshTokenExpiry;
      }

      // Handle token refresh
      if (Date.now() < token.refreshTokenExpiry) {
        if (Date.now() > token.accessTokenExpiry) {
          try {
            // Generate new tokens
            const newAccessToken = generateAccessToken({
              _id: token._id,
              email: token.email,
              username: token.username,
              isVerified: token.isVerified,
              organizationName: token.organizationName,
            });
            const newRefreshToken = generateRefreshToken({
              _id: token._id,
              email: token.email,
              username: token.username,
              isVerified: token.isVerified,
              organizationName: token.organizationName,
            });

            const decodedNewAccessToken = jwt.decode(newAccessToken, process.env.ACCESS_TOKEN_SECRET);
            const decodedNewRefreshToken = jwt.decode(newRefreshToken, process.env.REFRESH_TOKEN_SECRET);


            // Update refresh token in database
            await OwnerModel.findByIdAndUpdate(token._id, {
              refreshToken: newRefreshToken,
            });

            // Update token object
            token.accessToken = newAccessToken;
            token.refreshToken = newRefreshToken;
            token.accessTokenExpiry = decodedNewAccessToken.exp * 1000; // 20 seconds
            token.refreshTokenExpiry = decodedNewRefreshToken.exp * 1000; // 60 seconds
          } catch (error) {
            console.error("Error refreshing token:", error);
            return null; // Force logout on error
          }
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
