// proxy.ts (Next.js 16 – reemplazo de middleware.ts)
//
// Proxy / middleware desactivado temporalmente.
//
// Importante:
// - Este archivo NO exporta ninguna función `proxy` ni `default`,
//   por lo que Next.js y Vercel no registran Proxy/Middleware
//   y el proyecto no se ve afectado por incidencias relacionadas
//   con Middleware en la plataforma.
//
// Cuando quieras reactivar la lógica de autenticación / roles:
// 1. Recupera desde el historial de git la versión antigua de `middleware.ts`.
// 2. Transfórmala a este formato:
//
//    import { NextResponse, type NextRequest } from 'next/server';
//
//    export function proxy(request: NextRequest) {
//      // Lógica de auth / roles aquí...
//    }
//
//    export const config = {
//      matcher: [
//        '/dashboard/:path*',
//        '/api/users/:path*',
//      ],
//    };
//
// Mientras este archivo se mantenga solo con comentarios,
// no habrá Proxy activo en tu aplicación.

