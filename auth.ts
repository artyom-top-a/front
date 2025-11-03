import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter";

import { getUserById } from "@/data/user";
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation";
import authConfig from "./auth.config";
import { client } from "@/lib/prisma";
import { getAccountByUserId } from "@/data/account";
import { JWT } from "next-auth/jwt";

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  pages: {
    signIn: "/sign-in",
    // error: "/auth/error",
  },
  events: {
    async linkAccount({ user }) {
      await client.user.update({
        where: { id: user.id as string },
        data: { emailVerified: new Date() }
      })
    }
  },
  callbacks: {
    async signIn({ user, account }) {
      // Allow OAuth without email verification
      if (account?.provider !== "credentials") return true;

      const existingUser = await getUserById(user.id as string);

      // // Prevent sign in without email verification
      // if (!existingUser?.emailVerified) return false;

      // if (existingUser.isTwoFactorEnabled) {
      //   const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);

      //   if (!twoFactorConfirmation) return false;

      //   // Delete two factor confirmation for next sign in
      //   await client.twoFactorConfirmation.delete({
      //     where: { id: twoFactorConfirmation.id }
      //   });
      // }

      return true;
    },
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      // if (session.user) {
      //   session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;
      // }

      if (session.user) {
        session.user.name = token.name;
        session.user.email = token.email || '';
        session.user.isOAuth = token.isOAuth as boolean;
        session.user.generations = token.generations;
        session.user.generationsUsedThisMonth = token.generationsUsedThisMonth;
      }

      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;

      const existingUser = await getUserById(token.sub);

      if (!existingUser) return token;

      const existingAccount = await getAccountByUserId(
        existingUser.id
      );

      token.isOAuth = !!existingAccount;
      token.name = existingUser.name;
      token.email = existingUser.email;
      token.generations = existingUser.generations;
      token.generationsUsedThisMonth = existingUser.generationsUsedThisMonth;
      // token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled;

      return token;
    }

    // async jwt({ token, user, trigger }) {
    //   // 1) On initial sign-in, stamp the token with the real user data
    //   if (trigger === "signIn" && user?.id) {
    //     const dbUser = await getUserById(user.id);
    //     if (dbUser) {
    //       return {
    //         sub: user.id,
    //         name: dbUser.name,
    //         email: dbUser.email!,
    //         isOAuth: !!user.emailVerified,
    //         generations: dbUser.generations,
    //         generationsUsedThisMonth: dbUser.generationsUsedThisMonth,
    //       } as JWT;
    //     }
    //   }

    //   // 2) On subsequent calls, you can refresh from the DB if you like:
    //   if (token.sub) {
    //     const dbUser = await getUserById(token.sub);
    //     if (dbUser) {
    //       token.generations = dbUser.generations;
    //       token.generationsUsedThisMonth = dbUser.generationsUsedThisMonth;
    //       token.isOAuth = token.isOAuth ?? false;
    //     }
    //   }

    //   return token;
    // },

  
    // async session({ token, session }) {
    //   if (token.sub && session.user) {
    //     session.user.id    = token.sub
    //     session.user.name  = token.name!
    //     session.user.email = token.email!
    //     session.user.isOAuth                   = token.isOAuth as boolean
    //     session.user.generations               = token.generations as number
    //     session.user.generationsUsedThisMonth  = token.generationsUsedThisMonth as number
    //   }
    //   return session
    // },
  },
  adapter: PrismaAdapter(client),
  session: { strategy: "jwt" },
  // session: { strategy: "database" },
  ...authConfig,
});

