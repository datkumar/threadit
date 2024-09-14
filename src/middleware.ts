import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

// This function runs before every request is served (on the edge)
export const middleware = async (req: NextRequest) => {
  // Check JWT token exists
  const token = await getToken({ req });
  if (!token) {
    // Redirect to sign-in if token not present
    return NextResponse.redirect(new URL("/sign-in", req.nextUrl));
  }
};

// Run above middleware function only on matching (front-end) routes
export const config = {
  matcher: ["/c/create", "/c/:path*/submit"],
};
