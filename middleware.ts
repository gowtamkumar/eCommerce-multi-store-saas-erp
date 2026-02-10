import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
    const isAdminApiRoute =
      req.nextUrl.pathname.startsWith("/api/") &&
      !req.nextUrl.pathname.startsWith("/api/auth");

    // Sensitive routes that should be fully protected (all methods including GET)
    const sensitiveApiRoutes = [
      // "/api/orders",
      // "/api/payments",
      "/api/profile",
      "/api/users",
    ];

    const isSensitiveRoute = sensitiveApiRoutes.some((route) =>
      req.nextUrl.pathname.startsWith(route)
    );

    const isModifyingMethod = ["POST", "PUT", "DELETE", "PATCH"].includes(
      req.method
    );

    // Admin pages - require admin role
    if (isAdminRoute && token?.role !== "Admin") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Sensitive API routes - require authentication for all methods
    if (isSensitiveRoute && !token) {
      return NextResponse.json(
        { error: "Unauthorized. Authentication required." },
        { status: 401 }
      );
    }

    // Admin-only API routes - require admin role
    const adminOnlyRoutes = ["/api/users"];
    const isAdminOnlyRoute = adminOnlyRoutes.some((route) =>
      req.nextUrl.pathname.startsWith(route)
    );

    if (isAdminOnlyRoute && token?.role !== "Admin") {
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 }
      );
    }

    // Allow guest checkout - /api/orders POST doesn't require authentication
    const isGuestCheckout = req.nextUrl.pathname === '/api/orders' && req.method === 'POST';

    // All mutation operations (POST/PUT/DELETE/PATCH) require authentication, EXCEPT guest checkout
    if (isAdminApiRoute && isModifyingMethod && !token && !isGuestCheckout) {
      return NextResponse.json(
        { error: "Unauthorized. Authentication required for mutations." },
        { status: 401 }
      );
    }

    return NextResponse.next();
  },
  {
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        const isAdminApiRoute =
          path.startsWith("/api/") && !path.startsWith("/api/auth");
        const isModifyingMethod = ["POST", "PUT", "DELETE", "PATCH"].includes(
          req.method
        );

        // Sensitive routes that require authentication for all methods
        const sensitiveApiRoutes = [
          "/api/profile",
          "/api/users",
        ];
        const isSensitiveRoute = sensitiveApiRoutes.some((route) =>
          path.startsWith(route)
        );

        // Admin pages and profile require authentication
        if (path.startsWith("/admin") || path.startsWith("/profile")) {
          return !!token;
        }

        // Sensitive API routes require authentication for all methods
        if (isSensitiveRoute) {
          return !!token;
        }

        // Allow guest checkout - /api/orders POST doesn't require authentication
        const isGuestCheckout = path === '/api/orders' && req.method === 'POST';

        // Modifying API operations require authentication, EXCEPT guest checkout
        if (isAdminApiRoute && isModifyingMethod && !isGuestCheckout) {
          return !!token;
        }

        // All other routes are allowed
        return true;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

// Specify which routes to protect
export const config = {
  matcher: ["/admin", "/admin/:path*", "/profile", "/profile/:path*"],
};
