import type { Adapter } from "next-auth/adapters";
import { NextAuthOptions, getServerSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import { db } from "./db";
import { nanoid } from "nanoid";

// Configure NextAuth options
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as Adapter,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (token) {
        // Update properties of token into user session
        session.user = {
          ...session.user,
          id: token.id,
          name: token.name,
          email: token.email,
          image: token.picture,
          username: token.username,
        };
      }
      return session;
    },

    // Logic to construct JWT
    async jwt({ token, user }) {
      const userInDb = await db.user.findFirst({
        where: { email: token.email },
      });
      if (!userInDb) {
        token.id = user!.id;
        return token;
      }
      if (!userInDb.username) {
        await db.user.update({
          where: { id: userInDb.id },
          // Generate a 10-length unique string as username
          data: { username: nanoid(10) },
        });
      }
      return {
        id: userInDb.id,
        username: userInDb.username,
        name: userInDb.name,
        email: userInDb.email,
        picture: userInDb.image,
      };
    },

    async redirect() {
      return "/";
    },
  },
};

export const getAuthSession = () => getServerSession(authOptions);
