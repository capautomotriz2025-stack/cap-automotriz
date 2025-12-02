import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB, { isMongoDBAvailable } from './mongodb';
import User from '@/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email y contraseña son requeridos');
        }

        try {
          await connectDB();

          if (!isMongoDBAvailable()) {
            throw new Error('Base de datos no disponible');
          }

          // Buscar usuario (incluir password que está en select: false)
          const user = await User.findOne({ email: credentials.email }).select('+password');

          if (!user) {
            throw new Error('Usuario no encontrado');
          }

          if (!user.active) {
            throw new Error('Usuario inactivo');
          }

          // Verificar contraseña
          const isPasswordValid = await user.comparePassword(credentials.password);

          if (!isPasswordValid) {
            throw new Error('Contraseña incorrecta');
          }

          // Actualizar último login
          user.lastLogin = new Date();
          await user.save();

          // Retornar user data para la sesión
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error: any) {
          console.error('Error en authorize:', error);
          throw new Error(error.message || 'Error de autenticación');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Agregar datos del usuario al token JWT
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      // Agregar datos del token a la sesión
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  secret: process.env.NEXTAUTH_SECRET || 'development-secret-change-in-production',
};

