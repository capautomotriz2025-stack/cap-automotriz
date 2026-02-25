'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Kanban, 
  Bell,
  Zap,
  LogOut,
  Menu,
  X,
  Bot,
  UserCog,
  Gauge,
  Loader2,
  FileText,
  Home
} from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

const baseNavigation = [
  { name: 'Inicio', href: '/dashboard/inicio', icon: Home, badge: null, role: null },
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, badge: null, role: null },
  { name: 'Solicitudes', href: '/dashboard/requests', icon: FileText, badge: null, role: null },
  { name: 'Vacantes', href: '/dashboard/vacancies', icon: Briefcase, badge: null, role: null },
  { name: 'Evaluados', href: '/dashboard/candidates', icon: Users, badge: null, role: null },
  { name: 'Kanban', href: '/dashboard/kanban', icon: Kanban, badge: null, role: null },
  { name: 'Agentes IA', href: '/dashboard/ai-agents', icon: Bot, badge: 'IA', role: null },
  { name: 'Usuarios', href: '/dashboard/users', icon: UserCog, badge: 'Admin', role: 'superadmin' },
  { name: 'Notificaciones', href: '/dashboard/notifications', icon: Bell, badge: null, role: null },
  { name: 'BD Candidatos', href: '/dashboard/cvs-by-process', icon: FileText, badge: null, role: null },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  // Manager solo puede acceder a Solicitudes y Kanban; redirigir si intenta otra ruta
  useEffect(() => {
    if (status !== 'authenticated' || session?.user?.role !== 'manager') return;
    if (pathname !== '/dashboard/requests' && pathname !== '/dashboard/kanban') {
      router.replace('/dashboard/requests');
    }
  }, [status, session?.user?.role, pathname, router]);

  // Filtrar navegación según rol: manager solo Solicitudes y Kanban; admin/user todo excepto Usuarios; superadmin todo
  const navigation = (() => {
    const role = session?.user?.role;
    if (role === 'manager') {
      return baseNavigation.filter(item => item.href === '/dashboard/requests' || item.href === '/dashboard/kanban');
    }
    if (role === 'admin' || role === 'user') {
      return baseNavigation.filter(item => !item.role || item.role !== 'superadmin');
    }
    return baseNavigation;
  })();

  // Obtener conteo de notificaciones no leídas
  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const response = await axios.get('/api/notifications');
        if (response.data.success) {
          setNotificationCount(response.data.unreadCount || 0);
        }
      } catch (error) {
        console.error('Error fetching notification count:', error);
      }
    };

    fetchNotificationCount();
    // Verificar cada 30 segundos
    const interval = setInterval(fetchNotificationCount, 30000);
    
    // Verificar y crear notificaciones de vacantes expiradas cada minuto
    const checkExpiredVacancies = async () => {
      try {
        await axios.post('/api/notifications');
        fetchNotificationCount(); // Actualizar conteo después de crear notificaciones
      } catch (error) {
        console.error('Error checking expired vacancies:', error);
      }
    };
    const expiredInterval = setInterval(checkExpiredVacancies, 60000);
    
    return () => {
      clearInterval(interval);
      clearInterval(expiredInterval);
    };
  }, []);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-cap-gray-darkest to-cap-gray-dark">
        <Loader2 className="h-12 w-12 animate-spin text-cap-red" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cap-gray-darkest via-cap-gray-dark to-cap-gray-darkest">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-cap-black border-cap-red shadow-racing"
        >
          {sidebarOpen ? <X className="h-5 w-5 text-cap-red" /> : <Menu className="h-5 w-5 text-cap-red" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-cap-black to-cap-gray-darkest border-r-2 border-cap-red/30 shadow-2xl z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo CAP */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-cap-red/20 bg-racing-gradient">
            <div className="flex items-center gap-3">
              <img 
                src="/uploads/login.jpeg" 
                alt="CAP Logo" 
                className="w-12 h-12 object-contain rounded-full shadow-racing" 
              />
              <div>
                <h1 className="text-xl font-black text-white tracking-tight">
                  CAP RECRUIT
                </h1>
                <p className="text-xs text-white/70 uppercase tracking-widest font-bold">
                  Inicio
                </p>
              </div>
            </div>
          </div>

          {/* Racing Badge */}
          <div className="mx-4 mt-4 mb-2">
            <div className="p-3 rounded-lg bg-gradient-to-br from-cap-red/20 to-cap-red/5 border border-cap-red/30">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-cap-red" />
                <span className="text-cap-red font-bold text-sm uppercase tracking-wider">
                  IA Activa
                </span>
              </div>
              <p className="text-xs text-cap-gray-lightest">
                Sistema automotriz de alta velocidad
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            <p className="px-3 text-xs font-bold text-cap-gray uppercase tracking-wider mb-3">
              Menú Principal
            </p>
            {navigation.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/dashboard/inicio' && item.href !== '/dashboard' && pathname?.startsWith(item.href)) ||
                (item.href === '/dashboard' && pathname === '/dashboard') ||
                (item.href === '/dashboard/inicio' && pathname === '/dashboard/inicio');

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'group flex items-center justify-between px-3 py-3 text-sm font-bold rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-racing-gradient text-white shadow-racing'
                      : 'text-cap-gray-lightest hover:bg-cap-gray-dark hover:text-white'
                  )}
                >
                  <div className="flex items-center">
                    <item.icon className={cn(
                      'mr-3 h-5 w-5 transition-transform group-hover:scale-110',
                      isActive ? 'text-white' : 'text-cap-gray group-hover:text-cap-red'
                    )} />
                    {item.name}
                  </div>
                  {item.badge && (
                    <Badge className={cn(
                      "text-xs font-bold",
                      isActive 
                        ? "bg-white/20 text-white" 
                        : "bg-cap-red/20 text-cap-red"
                    )}>
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Quick Actions */}
          <div className="px-4 pb-4 space-y-2 border-t border-cap-red/20 pt-4">
            <p className="px-3 text-xs font-bold text-cap-gray uppercase tracking-wider mb-2">
              Acciones Rápidas
            </p>
            <Button 
              variant="outline" 
              className="w-full border-2 border-cap-red text-cap-red hover:bg-cap-red hover:text-white font-bold transition-all" 
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>

          {/* User Footer */}
          <div className="p-4 border-t border-cap-red/20 bg-cap-black">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-racing-gradient rounded-full flex items-center justify-center text-white font-black text-sm shadow-racing">
                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : session?.user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  {session?.user?.name || session?.user?.email || 'Usuario'}
                </p>
                <p className="text-xs text-cap-gray truncate">
                  {session?.user?.role === 'superadmin' ? 'Superadmin' : session?.user?.role === 'admin' ? 'RRHH' : session?.user?.role === 'manager' ? 'Jefe/Gerente' : 'Usuario'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <div className="sticky top-0 z-20 bg-cap-black/80 backdrop-blur-sm border-b border-cap-red/20 px-8 py-4 shadow-racing">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="hidden lg:block">
                <p className="text-sm text-cap-gray-lightest font-semibold">
                  Bienvenido de nuevo 👋 <span className="text-cap-red font-bold">{session?.user?.name || session?.user?.email}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-racing-gradient text-white hover:bg-racing-gradient font-bold shadow-racing">
                <Zap className="w-3 h-3 mr-1" />
                IA Activa
              </Badge>
              {/* Notificaciones */}
              <Link href="/dashboard/notifications">
                <Button variant="outline" size="icon" className="relative border-2 border-cap-red hover:bg-cap-red hover:text-white transition-all">
                  <Bell className="h-5 w-5 text-cap-red transition-colors" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-cap-red rounded-full text-xs text-white flex items-center justify-center font-bold shadow-racing animate-pulse">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-8 px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
