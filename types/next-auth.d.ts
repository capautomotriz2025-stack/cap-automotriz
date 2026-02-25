import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: 'superadmin' | 'admin' | 'manager' | 'user';
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: 'superadmin' | 'admin' | 'manager' | 'user';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'superadmin' | 'admin' | 'manager' | 'user';
  }
}

