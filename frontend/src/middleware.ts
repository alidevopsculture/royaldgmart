import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

const adminRoutes = ["/dashboard", "/customers", "/orders", "/products", "/notifications"];
const authRequiredRoutes = ["/checkout", "/wholesale-checkout"];

function isAdminRoute(pathname: string): boolean {
  return adminRoutes.some(route => 
    pathname === route || pathname.startsWith(route + "/")
  );
}

function requiresAuth(pathname: string): boolean {
  return isAdminRoute(pathname) || authRequiredRoutes.some(route => 
    pathname === route || pathname.startsWith(route + "/")
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Only check auth for routes that require it
  if (!requiresAuth(pathname)) {
    return NextResponse.next();
  }
  
  // Check for authentication token
  const token = request.cookies.get('token')?.value;
  
  // Set secure cookie options in production
  if (process.env.NODE_ENV === 'production') {
    const response = NextResponse.next();
    response.cookies.set({
      name: 'token',
      value: token || '',
      secure: true,
      httpOnly: true,
      sameSite: 'strict'
    });
  }
  
  if (!token) {
    const redirectParam = pathname === '/checkout' ? 'checkout' : pathname === '/wholesale-checkout' ? 'wholesale-checkout' : encodeURIComponent(pathname);
    return NextResponse.redirect(new URL('/auth?redirect=' + redirectParam + '&message=login-required', request.url));
  }
  
  try {
    const decoded: any = jwtDecode(token);
    const user = decoded.user || decoded;
    
    // Check admin routes
    if (isAdminRoute(pathname) && user.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    return NextResponse.next();
  } catch (error) {
    console.error('[ERROR] middleware JWT decode:', error instanceof Error ? error.message : error);
    // Invalid token, redirect to auth
    const redirectParam = pathname === '/checkout' ? 'checkout' : pathname === '/wholesale-checkout' ? 'wholesale-checkout' : encodeURIComponent(pathname);
    return NextResponse.redirect(new URL('/auth?redirect=' + redirectParam + '&message=login-required', request.url));
  }
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};