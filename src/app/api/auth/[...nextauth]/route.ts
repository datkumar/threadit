import { authOptions } from "@/lib/auth";
import NextAuth from "next-auth";

// Initialize NextAuth with a Route Handler:
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
// Handles any GET or POST request sent to route api/auth
