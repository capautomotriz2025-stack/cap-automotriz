'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Key, Eye, EyeOff, CheckCircle2, Loader2, Trash2 } from 'lucide-react';

export default function ApiKeyPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [keyInfo, setKeyInfo] = useState<any>(null);
  const [newApiKey, setNewApiKey] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [keyVisible, setKeyVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (session && session.user.role !== 'superadmin') {
      router.push('/dashboard');
    }
  }, [session, router]);

  useEffect(() => {
    fetchKeyInfo();
  }, []);

  const fetchKeyInfo = async () => {
    try {
      const res = await axios.get('/api/settings');
      if (res.data.success) setKeyInfo(res.data.data);
    } catch {}
  };

  const handleSave = async () => {
    if (!newApiKey.trim()) return;
    setSaving(true);
    setMsg('');
    try {
      const res = await axios.post('/api/settings', { apiKey: newApiKey.trim() });
      if (res.data.success) {
        setMsg('✅ API Key guardada correctamente.');
        setNewApiKey('');
        setShowInput(false);
        fetchKeyInfo();
      } else {
        setMsg('❌ ' + res.data.error);
      }
    } catch (e: any) {
      setMsg('❌ ' + (e.response?.data?.error || 'Error al guardar'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Eliminar la key de la base de datos? Se volverá a usar la variable de entorno.')) return;
    try {
      await axios.delete('/api/settings');
      setMsg('🗑️ Key eliminada. Usando variable de entorno.');
      fetchKeyInfo();
    } catch (e: any) {
      setMsg('❌ ' + (e.response?.data?.error || 'Error al eliminar'));
    }
  };

  return (
    <div className="p-8 max-w-xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <Key className="h-7 w-7 text-yellow-400" />
          API Key OpenAI
        </h1>
        <p className="text-cap-gray-lightest mt-2 font-semibold">
          Configurá la API Key usada para análisis de candidatos y generación de contenido.
        </p>
      </div>

      <Card className="border-2 border-yellow-500/30 bg-yellow-500/5">
        <CardHeader>
          <CardTitle className="text-white">Estado actual</CardTitle>
          <CardDescription className="text-cap-gray-lightest">
            Si hay una key cargada en la base de datos, se usa esa. Si no, se usa la variable de entorno (.env).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Estado */}
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
                <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                  keyInfo.source === 'database'
                    ? 'bg-blue-500/20 text-blue-300'
                    : keyInfo.source === 'environment'
                    ? 'bg-green-500/20 text-green-300'
                    : 'bg-red-500/20 text-red-300'
                }`}>
                  {keyInfo.source === 'database'
                    ? '📦 Desde base de datos'
                    : keyInfo.source === 'environment'
                    ? '🔧 Variable de entorno (.env)'
                    : '❌ No configurada'}
                </span>
                {keyInfo.lastUpdated && (
                  <span className="text-xs text-cap-gray-lightest">
                    Actualizada: {new Date(keyInfo.lastUpdated).toLocaleDateString('es-HN')}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Feedback */}
          {msg && (
            <p className="text-sm text-cap-gray-lightest bg-cap-black border border-cap-gray rounded-lg px-3 py-2">
              {msg}
            </p>
          )}

          {/* Formulario */}
          {showInput && (
            <div className="space-y-3 p-4 rounded-lg bg-cap-black border border-yellow-500/30">
              <Label className="text-white font-bold">Nueva API Key</Label>
              <div className="relative">
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
              <p className="text-xs text-muted-foreground">
                La key se guarda en la base de datos y tiene prioridad sobre el .env.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={saving || !newApiKey.trim()}
                  size="sm"
                  className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold"
                >
                  {saving
                    ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" />Guardando...</>
                    : <><CheckCircle2 className="h-3 w-3 mr-1" />Guardar Key</>}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setShowInput(false); setNewApiKey(''); }}
                  className="border-cap-gray text-cap-gray-lightest"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex gap-2 flex-wrap">
            {!showInput && (
              <Button
                onClick={() => { setShowInput(true); setMsg(''); }}
                size="sm"
                variant="outline"
                className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/10 font-bold"
              >
                <Key className="h-4 w-4 mr-2" />
                {keyInfo?.hasDbKey ? 'Cambiar API Key' : 'Cargar API Key'}
              </Button>
            )}
            {keyInfo?.hasDbKey && !showInput && (
              <Button
                onClick={handleDelete}
                size="sm"
                variant="outline"
                className="border-red-500/50 text-red-400 hover:bg-red-500/10 font-bold"
              >
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
