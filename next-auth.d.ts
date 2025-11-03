import NextAuth, { type DefaultSession } from "next-auth";

export type ExtendedUser = DefaultSession["user"] & {
  isTwoFactorEnabled: boolean;
  isOAuth: boolean;
  generations: int;
  generationsUsedThisMonth: int;
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}


// // src/types/next-auth.d.ts
// import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
// import { JWT as DefaultJWT } from "next-auth/jwt";

// declare module "next-auth" {
//   interface User extends DefaultUser {
//     /** Populated by your PrismaAdapter/User model */
//     generations: number;
//     generationsUsedThisMonth: number;
//     isOAuth: boolean;
//   }

//   interface Session {
//     user: {
//       id: string;
//       generations: number;
//       generationsUsedThisMonth: number;
//       isOAuth: boolean;
//     } & DefaultSession["user"];
//   }
// }

// declare module "next-auth/jwt" {
//   interface JWT extends DefaultJWT {
//     sub: string;
//     generations: number;
//     generationsUsedThisMonth: number;
//     isOAuth: boolean;
//   }
// }
