'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, Briefcase, Zap } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        setLoading(false);
      } else if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error: any) {
      setError('Error al iniciar sesión. Por favor intenta de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cap-gray-darkest via-cap-gray-dark to-cap-gray-darkest p-4 relative overflow-hidden">
      {/* Racing stripes background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-transparent via-cap-red to-transparent transform -skew-y-3"></div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-r from-transparent via-cap-red to-transparent transform skew-y-3"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo CAP */}
        <div className="text-center mb-8">
          <img 
            src="/uploads/login.jpeg" 
            alt="CAP Logo" 
            className="w-20 h-20 object-contain mx-auto mb-4 rounded-full shadow-racing-lg" 
          />
          <h1 className="text-4xl font-black text-white mb-2">
            CAP <span className="text-cap-red">RECRUITMENT</span>
          </h1>
          <p className="text-cap-gray-lightest font-semibold uppercase tracking-widest text-sm">
            Grupo Automotriz
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-cap-red/20 border border-cap-red/30 rounded-full px-4 py-2">
            <Zap className="w-4 h-4 text-cap-red" />
            <span className="text-cap-red font-bold text-sm uppercase tracking-wider">Sistema de Alta Velocidad</span>
          </div>
        </div>

        <Card className="border-2 border-cap-gray shadow-racing-xl bg-cap-gray-dark/80 backdrop-blur-sm">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-black text-white">Acceso al Dashboard</CardTitle>
            <CardDescription className="text-cap-gray-lightest font-semibold">
              Ingresa tus credenciales para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-4 bg-cap-red/20 border border-cap-red/50 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-cap-red flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-cap-red">Error de Autenticación</p>
                  <p className="text-xs text-cap-red-light mt-1">
                    Credenciales inválidas. Verifica tu email y contraseña.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-cap-gray-lightest font-bold">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={loading}
                  className="bg-cap-black border-cap-gray text-white placeholder:text-cap-gray focus:border-cap-red font-semibold"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-cap-gray-lightest font-bold">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={loading}
                  minLength={6}
                  className="bg-cap-black border-cap-gray text-white placeholder:text-cap-gray focus:border-cap-red font-semibold"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-racing-gradient hover:scale-105 transition-transform shadow-racing text-white font-black text-lg h-12"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-5 w-5" />
                    Iniciar Sesión
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-cap-gray-light">
                ¿Necesitas acceso?
              </p>
              <p className="text-xs text-cap-gray mt-1">
                Contacta al administrador del sistema
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-cap-gray mt-8 font-semibold">
          © 2025 CAP Grupo Automotriz. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cap-gray-darkest to-cap-gray-dark">
        <Loader2 className="w-8 h-8 animate-spin text-cap-red" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
