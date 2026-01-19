import { NextResponse } from 'next/server';
// Middleware desactivado temporalmente para debug de acceso
export default function middleware() {
	return NextResponse.next();
}
// ...original code commented below...
// Middleware desactivado temporalmente para debug de acceso
// import { withAuth } from 'next-auth/middleware';
// import { NextResponse } from 'next/server';

// export default withAuth(
//   function middleware(req) {
//     const token = req.nextauth.token;
//     const path = req.nextUrl.pathname;

//     // Rutas de superadmin
//     if (path.startsWith('/dashboard/users') || path.startsWith('/dashboard/settings')) {
//       if (token?.role !== 'superadmin') {
//         return NextResponse.redirect(new URL('/dashboard', req.url));
//       }
//     }

//     return NextResponse.next();
//   },
//   {
//     callbacks: {
//       authorized: ({ token }) => !!token,
//     },
//     pages: {
//       signIn: '/login',
//     },
//   }
// );

// export const config = {
//   matcher: [
//     '/dashboard/:path*',
//     '/api/users/:path*',
//   ],
// };

