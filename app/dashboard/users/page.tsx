'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Loader2, Plus, Edit2, Trash2, UserPlus, Shield, User as UserIcon, X, Key, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export default function UsersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  // OpenAI Key state
  const [keyInfo, setKeyInfo] = useState<any>(null);
  const [newApiKey, setNewApiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keyVisible, setKeyVisible] = useState(false);
  const [keySaving, setKeySaving] = useState(false);
  const [keyMsg, setKeyMsg] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    active: true,
  });

  // Redirigir si no es superadmin
  useEffect(() => {
    if (session && session.user.role !== 'superadmin') {
      router.push('/dashboard');
    }
  }, [session, router]);

  useEffect(() => {
    fetchUsers();
    fetchKeyInfo();
  }, []);

  const fetchKeyInfo = async () => {
    try {
      const res = await axios.get('/api/settings');
      if (res.data.success) setKeyInfo(res.data.data);
    } catch {}
  };

  const handleSaveKey = async () => {
    if (!newApiKey.trim()) return;
    setKeySaving(true);
    setKeyMsg('');
    try {
      const res = await axios.post('/api/settings', { apiKey: newApiKey.trim() });
      if (res.data.success) {
        setKeyMsg('✅ API Key guardada correctamente.');
        setNewApiKey('');
        setShowKeyInput(false);
        fetchKeyInfo();
      } else {
        setKeyMsg('❌ ' + res.data.error);
      }
    } catch (e: any) {
      setKeyMsg('❌ ' + (e.response?.data?.error || 'Error al guardar'));
    } finally {
      setKeySaving(false);
    }
  };

  const handleDeleteKey = async () => {
    if (!confirm('¿Eliminar la API Key de la base de datos? Se usará la variable de entorno.')) return;
    try {
      await axios.delete('/api/settings');
      setKeyMsg('🗑️ Key eliminada. Usando variable de entorno.');
      fetchKeyInfo();
    } catch (e: any) {
      setKeyMsg('❌ ' + (e.response?.data?.error || 'Error al eliminar'));
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/users');
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingUser) {
        // Actualizar usuario
        await axios.put(`/api/users/${editingUser._id}`, formData);
      } else {
        // Crear usuario
        await axios.post('/api/users', formData);
      }
      
      setShowModal(false);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error al guardar usuario');
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      active: user.active,
    });
    setShowModal(true);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

    try {
      await axios.delete(`/api/users/${userId}`);
      fetchUsers();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error al eliminar usuario');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'user',
      active: true,
    });
    setEditingUser(null);
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, { color: string; icon: any }> = {
      superadmin: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Shield },
      admin: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Shield },
      manager: { color: 'bg-amber-100 text-amber-800 border-amber-200', icon: UserIcon },
      user: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: UserIcon },
    };

    const variant = variants[role] || variants.user;
    const Icon = variant.icon;

    return (
      <Badge variant="outline" className={variant.color}>
        <Icon className="w-3 h-3 mr-1" />
        {role}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">Gestión de Usuarios</h1>
        <p className="text-cap-gray-lightest mt-2 font-semibold">Administra los usuarios del sistema</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="mb-6">
        <Button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo Usuario
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios del Sistema</CardTitle>
          <CardDescription>
            Total de usuarios: {users.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="pb-3 font-semibold">Nombre</th>
                  <th className="pb-3 font-semibold">Email</th>
                  <th className="pb-3 font-semibold">Rol</th>
                  <th className="pb-3 font-semibold">Estado</th>
                  <th className="pb-3 font-semibold">Último login</th>
                  <th className="pb-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b last:border-0">
                    <td className="py-4">{user.name}</td>
                    <td className="py-4 text-gray-600">{user.email}</td>
                    <td className="py-4">{getRoleBadge(user.role)}</td>
                    <td className="py-4">
                      {user.active ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                          Activo
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                          Inactivo
                        </Badge>
                      )}
                    </td>
                    <td className="py-4 text-gray-600 text-sm">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString('es-ES')
                        : 'Nunca'}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        {user.role !== 'superadmin' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(user._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={!!editingUser}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">
                    Contraseña {editingUser && '(dejar en blanco para mantener)'}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingUser}
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Rol</Label>
                  <select
                    id="role"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="user">User</option>
                    <option value="manager">Manager (Jefe/Gerente)</option>
                    <option value="admin">Admin (RRHH)</option>
                    <option value="superadmin">Superadmin</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="active" className="cursor-pointer">
                    Usuario activo
                  </Label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingUser ? 'Actualizar' : 'Crear'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Configuración OpenAI API Key */}
      <Card className="border-2 border-yellow-500/30 bg-yellow-500/5">
        <CardHeader>
          <CardTitle className="text-xl font-black text-white flex items-center gap-2">
            <Key className="h-5 w-5 text-yellow-400" />
            Configuración OpenAI API Key
          </CardTitle>
          <CardDescription className="text-cap-gray-lightest">
            Gestioná la API Key de OpenAI usada para análisis de candidatos y generación de contenido.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Estado actual */}
          {keyInfo && (
            <div className="p-4 rounded-lg bg-cap-black border border-cap-gray space-y-2">
              <p className="text-xs font-bold text-cap-gray-lightest uppercase tracking-wide">Key activa</p>
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${keyInfo.source === 'none' ? 'bg-red-500' : 'bg-green-400'}`} />
                <span className="text-sm font-semibold text-white font-mono">
                  {keyInfo.maskedKey || 'Sin key configurada'}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded font-bold ${keyInfo.source === 'database' ? 'bg-blue-500/20 text-blue-300' : keyInfo.source === 'environment' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                  {keyInfo.source === 'database' ? '📦 Desde base de datos' : keyInfo.source === 'environment' ? '🔧 Variable de entorno (.env)' : '❌ No configurada'}
                </span>
                {keyInfo.lastUpdated && (
                  <span className="text-xs text-cap-gray-lightest">
                    Actualizada: {new Date(keyInfo.lastUpdated).toLocaleDateString('es-HN')}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Mensaje de feedback */}
          {keyMsg && (
            <p className="text-sm text-cap-gray-lightest bg-cap-black border border-cap-gray rounded-lg px-3 py-2">
              {keyMsg}
            </p>
          )}

          {/* Formulario nueva key */}
          {showKeyInput && (
            <div className="space-y-3 p-4 rounded-lg bg-cap-black border border-yellow-500/30">
              <Label className="text-white font-bold">Nueva API Key</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={keyVisible ? 'text' : 'password'}
                    placeholder="sk-proj-..."
                    value={newApiKey}
                    onChange={(e) => setNewApiKey(e.target.value)}
                    className="pr-10 font-mono text-sm bg-cap-gray-dark border-white/20 text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setKeyVisible(!keyVisible)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-cap-gray-lightest hover:text-white"
                  >
                    {keyVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                La key se guarda en la base de datos y tiene prioridad sobre la variable de entorno.
              </p>
              <div className="flex gap-2">
                <Button onClick={handleSaveKey} disabled={keySaving || !newApiKey.trim()} size="sm" className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold">
                  {keySaving ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" />Guardando...</> : <><CheckCircle2 className="h-3 w-3 mr-1" />Guardar Key</>}
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setShowKeyInput(false); setNewApiKey(''); }} className="border-cap-gray text-cap-gray-lightest">
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex gap-2 flex-wrap">
            {!showKeyInput && (
              <Button onClick={() => { setShowKeyInput(true); setKeyMsg(''); }} size="sm" variant="outline" className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/10 font-bold">
                <Key className="h-4 w-4 mr-2" />
                {keyInfo?.hasDbKey ? 'Cambiar API Key' : 'Cargar API Key'}
              </Button>
            )}
            {keyInfo?.hasDbKey && !showKeyInput && (
              <Button onClick={handleDeleteKey} size="sm" variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10 font-bold">
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar key de DB
              </Button>
            )}
          </div>

        </CardContent>
      </Card>

    </div>
  );
}

