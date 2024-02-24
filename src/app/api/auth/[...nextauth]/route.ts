import { authOptions } from "@/lib/auth";
import NextAuth from "next-auth";

// Initialize NextAuth with a Route Handler:
const authHandler = NextAuth(authOptions);
export { authHandler as GET, authHandler as POST };
// Handles any GET or POST request sent to route api/auth
