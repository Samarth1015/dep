// client\types\next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    accessToken: string;
    user: {
      /** The user's postal address. */
      address: string;
      email: string;
    };
  }
}
