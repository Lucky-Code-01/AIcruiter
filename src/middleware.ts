import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // 👉 yaha extra logic likh sakte ho agar chaho
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // ✅ agar token hai → user logged in
        return !!token;
      },
    },
    pages: {
      signIn: "/sign-in", // 👈 login page
    },
  }
);

// 👉 kis route par middleware lagega
export const config = {
  matcher: [
    "/dashboard",
    "/interview/:path*",
    "/interview-history",
    "/interview-dashboard/:path*",
    "/live-interview/:path*"
  ],
};