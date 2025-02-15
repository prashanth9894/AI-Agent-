// import { NextResponse } from 'next/server'
// import { authMiddleware } from "@clerk/nextjs";

// export default function middleware(req: any) {
//   const publicRoutes = ["/", "/api/webhook"];
  
//   if (publicRoutes.includes(req.nextUrl.pathname)) {
//     return NextResponse.next();
//   }

//   return authMiddleware(req);
// }

// export const config = {
//   matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
// };


// import { clerkMiddleware, getAuth } from "@clerk/nextjs/server";
// import { NextResponse } from 'next/server';

// export default clerkMiddleware((req) => {
//   const { userId } = getAuth(req);
  
//   const publicPaths = ['/', '/sign-in', '/sign-up', '/api/webhook'];
  
//   if (!userId && !publicPaths.includes(req.nextUrl.pathname)) {
//     return new NextResponse('Unauthorized', { status: 401 });
//   }
  
//   return NextResponse.next();
// });

// export const config = {
//   matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
// };


import { NextResponse } from 'next/server';
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};