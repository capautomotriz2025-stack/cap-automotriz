'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle2, Clock, Briefcase, Users, AlertCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Notification {
  _id: string;
  type: 'vacancy_deadline' | 'vacancy_closed' | 'candidate_applied' | 'system';
  title: string;
  message: string;
  relatedVacancyId?: string | { _id: string; title?: string };
  relatedCandidateId?: string | { _id: string; fullName?: string };
  read: boolean;
  readAt?: string;
  createdAt: string;
}

function getVacancyId(relatedVacancyId: Notification['relatedVacancyId']): string | null {
  if (!relatedVacancyId) return null;
  return typeof relatedVacancyId === 'object' && relatedVacancyId !== null && '_id' in relatedVacancyId
    ? (relatedVacancyId as { _id: string })._id
    : String(relatedVacancyId);
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    // Refrescar cada 30 segundos para nuevas notificaciones
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      // Crear notificaciones de "tiempo de recepción de CVs finalizado" para vacantes con fecha límite vencida
      try {
        await axios.post('/api/notifications');
      } catch (_) {
        // Ignorar si falla (ej. sin vacantes vencidas)
      }
      const response = await axios.get('/api/notifications');
      if (response.data.success) {
        setNotifications(response.data.data);
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`);
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, read: true, readAt: new Date().toISOString() } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, read: true, readAt: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await axios.delete(`/api/notifications/${notificationId}`);
      setNotifications(notifications.filter(n => n._id !== notificationId));
      if (!notifications.find(n => n._id === notificationId)?.read) {
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'vacancy_deadline':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'vacancy_closed':
        return <Briefcase className="h-5 w-5 text-blue-500" />;
      case 'candidate_applied':
        return <Users className="h-5 w-5 text-green-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-cap-red" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'vacancy_deadline':
        return 'border-yellow-500/30 bg-yellow-500/10';
      case 'vacancy_closed':
        return 'border-blue-500/30 bg-blue-500/10';
      case 'candidate_applied':
        return 'border-green-500/30 bg-green-500/10';
      default:
        return 'border-cap-red/30 bg-cap-red/10';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cap-red"></div>
      </div>
    );
  }

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">Notificaciones</h1>
          <p className="text-cap-gray-lightest mt-2 font-semibold">
            {unreadCount > 0 ? `${unreadCount} notificación${unreadCount > 1 ? 'es' : ''} sin leer` : 'Todas las notificaciones leídas'}
          </p>
          <p className="text-cap-gray mt-1 text-sm">
            Se muestran las del último año. Puedes borrarlas para no acumular.
          </p>
        </div>
        {unreadNotifications.length > 0 && (
          <Button
            onClick={markAllAsRead}
            className="bg-racing-gradient hover:scale-105 transition-transform shadow-racing font-bold"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Marcar todas como leídas
          </Button>
        )}
      </div>

      {/* Notificaciones no leídas */}
      {unreadNotifications.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Bell className="h-5 w-5 text-cap-red" />
            Sin leer ({unreadNotifications.length})
          </h2>
          {unreadNotifications.map((notification) => (
            <Card
              key={notification._id}
              className={`border-2 ${getNotificationColor(notification.type)} hover:shadow-racing transition-all`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <CardTitle className="text-lg font-black text-white mb-1">
                        {notification.title}
                      </CardTitle>
                      <CardDescription className="text-cap-gray-lightest font-semibold">
                        {notification.message}
                      </CardDescription>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs font-bold border-cap-gray text-cap-gray-lightest">
                          {new Date(notification.createdAt).toLocaleString('es-MX', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Badge>
                        {getVacancyId(notification.relatedVacancyId) && (
                          <Link href={`/dashboard/vacancies/${getVacancyId(notification.relatedVacancyId)}`}>
                            <Button variant="outline" size="sm" className="text-xs border-2 border-cap-gray text-cap-red hover:border-cap-red hover:text-cap-red font-bold">
                              Ver Vacante
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markAsRead(notification._id)}
                      className="border-2 border-cap-gray text-cap-red hover:border-cap-red hover:text-cap-red font-bold"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteNotification(notification._id)}
                      className="border-2 border-cap-red text-cap-red hover:bg-cap-red hover:text-white font-bold"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Notificaciones leídas */}
      {readNotifications.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-black text-cap-gray-lightest flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-cap-gray" />
            Leídas ({readNotifications.length})
          </h2>
          {readNotifications.map((notification) => (
            <Card
              key={notification._id}
              className={`border-2 border-cap-gray/30 bg-cap-gray-dark/50 opacity-75 hover:opacity-100 transition-all`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <CardTitle className="text-lg font-black text-cap-gray-lightest mb-1">
                        {notification.title}
                      </CardTitle>
                      <CardDescription className="text-cap-gray font-semibold">
                        {notification.message}
                      </CardDescription>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs font-bold border-cap-gray text-cap-gray">
                          {new Date(notification.createdAt).toLocaleString('es-MX', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Badge>
                        {getVacancyId(notification.relatedVacancyId) && (
                          <Link href={`/dashboard/vacancies/${getVacancyId(notification.relatedVacancyId)}`}>
                            <Button variant="outline" size="sm" className="text-xs border-2 border-cap-gray text-cap-gray hover:border-cap-red hover:text-cap-red font-bold">
                              Ver Vacante
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteNotification(notification._id)}
                    className="border-2 border-cap-gray text-cap-gray hover:border-cap-red hover:text-cap-red font-bold"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Estado vacío */}
      {notifications.length === 0 && (
        <Card className="border-2 border-cap-gray bg-cap-gray-dark/80">
          <CardContent className="py-12 text-center">
            <Bell className="h-16 w-16 text-cap-gray mx-auto mb-4" />
            <h3 className="text-xl font-black text-white mb-2">No hay notificaciones</h3>
            <p className="text-cap-gray-lightest font-semibold">
              Las notificaciones aparecerán aquí cuando haya actualizaciones importantes
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
