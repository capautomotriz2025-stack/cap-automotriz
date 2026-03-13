'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Bot, 
  Plus, 
  Search, 
  Star, 
  Users, 
  TrendingUp,
  Sparkles,
  Settings,
  Eye,
  Trash2,
  BarChart3,
  Edit,
  X,
  CheckCircle2,
  Target,
  Zap,
  FileSearch,
  Loader2,
  Upload
} from 'lucide-react';

export default function AIAgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [evalAgent, setEvalAgent] = useState<any>(null);
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  const [evalFile, setEvalFile] = useState<File | null>(null);
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalResult, setEvalResult] = useState<any>(null);
  const [evalError, setEvalError] = useState('');

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    let filtered = agents;

    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(a => a.category === filterCategory);
    }

    setFilteredAgents(filtered);
  }, [searchTerm, filterCategory, agents]);

  const fetchAgents = async () => {
    try {
      console.log('🔍 Fetching agents...');
      const response = await axios.get('/api/ai-agents');
      console.log('📥 Response:', response.data);
      if (response.data.success) {
        console.log('✅ Agents loaded:', response.data.data.length);
        setAgents(response.data.data);
        setFilteredAgents(response.data.data);
      }
    } catch (error) {
      console.error('❌ Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (agentId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este agente? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await axios.delete(`/api/ai-agents/${agentId}`);
      setAgents(agents.filter(a => a._id !== agentId));
      alert('Agente eliminado exitosamente');
    } catch (error: any) {
      console.error('Error deleting agent:', error);
      const msg = error.response?.data?.error || 'Error al eliminar el agente';
      alert(`Error: ${msg}`);
    }
  };

  const openDetailsModal = (agent: any) => {
    setSelectedAgent(agent);
    setIsModalOpen(true);
  };

  const openEvalModal = (agent: any) => {
    setEvalAgent(agent);
    setEvalFile(null);
    setEvalResult(null);
    setEvalError('');
    setIsEvalModalOpen(true);
  };

  const handleEvaluateCV = async () => {
    if (!evalFile || !evalAgent) return;
    setEvalLoading(true);
    setEvalResult(null);
    setEvalError('');
    try {
      const form = new FormData();
      form.append('cv', evalFile);
      const res = await axios.post(`/api/ai-agents/${evalAgent._id}/evaluate-cv`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setEvalResult(res.data.data);
      } else {
        setEvalError(res.data.error || 'Error al evaluar el CV');
      }
    } catch (e: any) {
      setEvalError(e.response?.data?.error || 'Error al evaluar el CV');
    } finally {
      setEvalLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: any = {
      desarrollo: '🖥️',
      gerencia: '💼',
      diseño: '🎨',
      marketing: '📊',
      finanzas: '💰',
      rrhh: '🎓',
      operaciones: '🏗️',
      soporte: '🔧',
      otro: '📋'
    };
    return icons[category] || '📋';
  };

  const getCategoryColor = (category: string) => {
    const colors: any = {
      desarrollo: 'bg-cap-red/20 text-cap-red border-cap-red/30',
      gerencia: 'bg-cap-gray text-cap-gray-lightest',
      diseño: 'bg-cap-red/20 text-cap-red border-cap-red/30',
      marketing: 'bg-cap-gray text-cap-gray-lightest',
      finanzas: 'bg-cap-red/20 text-cap-red border-cap-red/30',
      rrhh: 'bg-cap-gray text-cap-gray-lightest',
      operaciones: 'bg-cap-red/20 text-cap-red border-cap-red/30',
      soporte: 'bg-cap-gray text-cap-gray-lightest',
      otro: 'bg-cap-gray text-cap-gray-lightest'
    };
    return colors[category] || 'bg-cap-gray text-cap-gray-lightest';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cap-red"></div>
      </div>
    );
  }

  const templates = agents.filter(a => a.isTemplate);
  const customAgents = agents.filter(a => !a.isTemplate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white flex items-center gap-3">
            <Bot className="h-10 w-10 text-cap-red" />
            Agentes de Evaluación IA
          </h1>
          <p className="text-cap-gray-lightest mt-2 text-lg font-semibold">
            Configura cómo la IA evalúa a tus candidatos
          </p>
        </div>
        <Link href="/dashboard/ai-agents/new">
          <Button size="lg" className="bg-racing-gradient hover:scale-105 transition-transform shadow-racing font-black">
            <Plus className="mr-2 h-5 w-5" />
            Crear Agente Personalizado
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-2 border-cap-red/30 bg-cap-gray-dark/80 backdrop-blur-sm hover:scale-105 transition-transform">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-racing-gradient rounded-xl flex items-center justify-center shadow-racing">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-black text-white">{templates.length}</div>
                <div className="text-sm text-cap-gray-lightest font-bold">Plantillas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-cap-gray bg-cap-gray-dark/80 backdrop-blur-sm hover:scale-105 transition-transform">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-cap-gray rounded-xl flex items-center justify-center">
                <Bot className="h-6 w-6 text-cap-gray-lightest" />
              </div>
              <div>
                <div className="text-2xl font-black text-white">{customAgents.length}</div>
                <div className="text-sm text-cap-gray-lightest font-bold">Custom</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-cap-red/30 bg-cap-gray-dark/80 backdrop-blur-sm hover:scale-105 transition-transform">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-racing-gradient rounded-xl flex items-center justify-center shadow-racing">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-black text-cap-red">
                  {agents.reduce((sum, a) => sum + (a.usageCount || 0), 0)}
                </div>
                <div className="text-sm text-cap-gray-lightest font-bold">Usos Totales</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-cap-gray bg-cap-gray-dark/80 backdrop-blur-sm hover:scale-105 transition-transform">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-cap-gray rounded-xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-cap-gray-lightest" />
              </div>
              <div>
                <div className="text-2xl font-black text-white">{agents.filter(a => a.active).length}</div>
                <div className="text-sm text-cap-gray-lightest font-bold">Activos</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-2 border-cap-gray bg-cap-gray-dark/80 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-cap-gray" />
              <Input
                placeholder="Buscar agentes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-cap-black border-cap-gray text-white placeholder:text-cap-gray focus:border-cap-red font-semibold"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border-2 border-cap-gray rounded-md bg-cap-black text-white font-bold focus:border-cap-red"
            >
              <option value="all">Todas las categorías</option>
              <option value="desarrollo">🖥️ Desarrollo</option>
              <option value="gerencia">💼 Gerencia</option>
              <option value="diseño">🎨 Diseño</option>
              <option value="marketing">📊 Marketing</option>
              <option value="finanzas">💰 Finanzas</option>
              <option value="rrhh">🎓 Recursos Humanos</option>
              <option value="operaciones">🏗️ Operaciones</option>
              <option value="soporte">🔧 Soporte</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Plantillas del Sistema */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Star className="h-5 w-5 text-cap-red fill-cap-red" />
          <h2 className="text-2xl font-black text-white">Plantillas del Sistema</h2>
          <Badge className="bg-racing-gradient text-white font-bold shadow-racing">Pre-configuradas</Badge>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgents.filter(a => a.isTemplate).map((agent) => (
            <Card key={agent.name} className="bg-cap-gray-dark/80 backdrop-blur-sm border-2 border-cap-gray hover:border-cap-red hover:scale-105 transition-all">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="text-4xl">{getCategoryIcon(agent.category)}</div>
                  <Badge className={`${getCategoryColor(agent.category)} font-bold border`}>
                    {agent.category}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-black text-white">{agent.name}</CardTitle>
                <CardDescription className="text-cap-gray-lightest font-semibold">
                  Agente especializado en {agent.category}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm font-semibold">
                  <div className="flex items-center gap-2 text-cap-gray-lightest">
                    <BarChart3 className="h-4 w-4 text-cap-gray" />
                    <span>Usado {agent.usageCount || 0}x</span>
                  </div>
                  <div className="flex items-center gap-2 text-cap-red">
                    <Sparkles className="h-4 w-4" />
                    <span>Template</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm bg-cap-black p-3 rounded-lg border border-cap-gray font-semibold">
                  <div className="flex justify-between text-cap-gray-lightest">
                    <span>Experiencia:</span>
                    <span className="text-white font-bold">{agent.criteria.experience.weight} pts</span>
                  </div>
                  <div className="flex justify-between text-cap-gray-lightest">
                    <span>Skills Técnicas:</span>
                    <span className="text-white font-bold">{agent.criteria.technicalSkills.weight} pts</span>
                  </div>
                  <div className="flex justify-between text-cap-gray-lightest">
                    <span>Educación:</span>
                    <span className="text-white font-bold">{agent.criteria.education.weight} pts</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-2 border-cap-red text-cap-red hover:bg-cap-red hover:text-white font-bold transition-all"
                    onClick={() => openDetailsModal(agent)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Detalles
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-2 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white font-bold transition-all"
                    onClick={() => openEvalModal(agent)}
                    title="Evaluar CV con este agente"
                  >
                    <FileSearch className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Agentes Personalizados */}
      {customAgents.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Settings className="h-5 w-5 text-cap-red" />
            <h2 className="text-2xl font-black text-white">Mis Agentes Personalizados</h2>
            <Badge className="bg-cap-gray text-cap-gray-lightest font-bold">Custom</Badge>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAgents.filter(a => !a.isTemplate).map((agent) => (
              <Card key={agent._id} className="bg-cap-gray-dark/80 backdrop-blur-sm border-2 border-cap-gray hover:border-cap-red hover:scale-105 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-4xl">{getCategoryIcon(agent.category)}</div>
                    <Badge className={`${getCategoryColor(agent.category)} font-bold border`}>
                      {agent.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-black text-white">{agent.name}</CardTitle>
                  <CardDescription className="text-cap-gray-lightest font-semibold">
                    Agente personalizado
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm font-semibold">
                    <div className="flex items-center gap-2 text-cap-gray-lightest">
                      <BarChart3 className="h-4 w-4 text-cap-gray" />
                      <span>Usado {agent.usageCount || 0}x</span>
                    </div>
                    <div className="flex items-center gap-2 text-cap-gray-lightest">
                      <Settings className="h-4 w-4 text-cap-gray" />
                      <span>Custom</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-2 border-cap-red text-cap-red hover:bg-cap-red hover:text-white font-bold transition-all"
                      onClick={() => openDetailsModal(agent)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-2 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white font-bold transition-all"
                      onClick={() => openEvalModal(agent)}
                      title="Evaluar CV con este agente"
                    >
                      <FileSearch className="h-4 w-4" />
                    </Button>
                    <Link href={`/dashboard/ai-agents/${agent._id}/edit`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-2 border-cap-red text-cap-red hover:bg-cap-red hover:text-white font-bold transition-all"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-2 border-cap-red text-cap-red hover:bg-cap-red hover:text-white font-bold transition-all"
                      onClick={() => handleDelete(agent._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredAgents.length === 0 && (
        <Card className="bg-cap-gray-dark/80 backdrop-blur-sm border-2 border-cap-gray">
          <CardContent className="py-16 text-center">
            <Bot className="h-16 w-16 text-cap-gray mx-auto mb-4" />
            <h3 className="text-xl font-black text-white mb-2">
              No se encontraron agentes
            </h3>
            <p className="text-cap-gray-lightest mb-6 font-semibold">
              {searchTerm || filterCategory !== 'all' 
                ? 'Intenta con otros filtros de búsqueda'
                : 'Crea tu primer agente personalizado'}
            </p>
            <Link href="/dashboard/ai-agents/new">
              <Button className="bg-racing-gradient hover:scale-105 transition-transform shadow-racing font-bold">
                <Plus className="mr-2 h-4 w-4" />
                Crear Agente
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Modal Evaluar CV */}
      <Dialog open={isEvalModalOpen} onOpenChange={(o) => { setIsEvalModalOpen(o); if (!o) { setEvalResult(null); setEvalError(''); setEvalFile(null); } }}>
        <DialogContent className="max-w-xl bg-cap-gray-dark border-2 border-blue-500 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-white flex items-center gap-2">
              <FileSearch className="h-5 w-5 text-blue-400" />
              Evaluar CV — {evalAgent?.name}
            </DialogTitle>
            <DialogDescription className="text-cap-gray-lightest">
              Subí un PDF para que el agente lo evalúe automáticamente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Upload */}
            <div className="border-2 border-dashed border-blue-500/40 rounded-lg p-4 text-center space-y-2">
              <Upload className="h-8 w-8 text-blue-400 mx-auto" />
              <p className="text-sm text-cap-gray-lightest">Seleccioná el CV del candidato (PDF)</p>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                id="eval-cv-input"
                onChange={(e) => { setEvalFile(e.target.files?.[0] || null); setEvalResult(null); setEvalError(''); }}
              />
              <label htmlFor="eval-cv-input" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors">
                {evalFile ? evalFile.name : 'Elegir archivo PDF'}
              </label>
            </div>

            {evalError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-300">
                ⚠️ {evalError}
              </div>
            )}

            {evalResult && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-cap-black border border-cap-gray">
                  <span className="text-sm font-bold text-white">Score</span>
                  <span className={`text-2xl font-black ${evalResult.score >= 80 ? 'text-green-400' : evalResult.score >= 65 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {evalResult.score}/100
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-cap-black border border-cap-gray">
                  <p className="text-xs font-bold text-cap-gray-lightest mb-1">Clasificación</p>
                  <span className={`text-sm font-black px-2 py-1 rounded ${evalResult.classification === 'ideal' ? 'bg-green-500/20 text-green-300' : evalResult.classification === 'potential' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'}`}>
                    {evalResult.classification === 'ideal' ? '⭐ Ideal' : evalResult.classification === 'potential' ? '⚡ Potencial' : '❌ No perfila'}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-cap-black border border-cap-gray text-sm text-cap-gray-lightest">
                  <p className="font-bold text-white mb-1">Resumen</p>
                  {evalResult.summary}
                </div>
                {evalResult.strengths?.length > 0 && (
                  <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20 text-sm">
                    <p className="font-bold text-green-300 mb-1">Fortalezas</p>
                    <ul className="space-y-1">
                      {evalResult.strengths.map((s: string, i: number) => <li key={i} className="text-cap-gray-lightest">✓ {s}</li>)}
                    </ul>
                  </div>
                )}
                {evalResult.concerns?.length > 0 && (
                  <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 text-sm">
                    <p className="font-bold text-red-300 mb-1">Preocupaciones</p>
                    <ul className="space-y-1">
                      {evalResult.concerns.map((c: string, i: number) => <li key={i} className="text-cap-gray-lightest">⚠ {c}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <button onClick={() => setIsEvalModalOpen(false)} className="px-4 py-2 rounded-md border border-cap-gray text-cap-gray-lightest hover:border-white text-sm font-bold transition-colors">
                Cerrar
              </button>
              <button
                onClick={handleEvaluateCV}
                disabled={!evalFile || evalLoading}
                className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold transition-colors flex items-center gap-2"
              >
                {evalLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analizando...</> : <><FileSearch className="h-4 w-4" /> Analizar CV</>}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalles */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl bg-cap-gray-dark border-2 border-cap-red text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-4xl">{selectedAgent && getCategoryIcon(selectedAgent.category)}</div>
                <div>
                  <DialogTitle className="text-2xl font-black text-white">
                    {selectedAgent?.name}
                  </DialogTitle>
                  <DialogDescription className="text-cap-gray-lightest font-semibold">
                    Agente especializado en {selectedAgent?.category}
                  </DialogDescription>
                </div>
              </div>
              <Badge className={selectedAgent && getCategoryColor(selectedAgent.category)}>
                {selectedAgent?.category}
              </Badge>
            </div>
          </DialogHeader>

          {selectedAgent && (
            <div className="space-y-6 mt-4">
              {/* Descripción */}
              <div className="bg-cap-black p-4 rounded-lg border border-cap-gray">
                <h3 className="font-black text-cap-red mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Descripción
                </h3>
                <p className="text-cap-gray-lightest font-semibold">
                  {selectedAgent.description || 'Sin descripción'}
                </p>
              </div>

              {/* Estadísticas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-cap-black p-4 rounded-lg border border-cap-gray">
                  <div className="flex items-center gap-2 text-cap-red font-bold mb-1">
                    <BarChart3 className="w-4 h-4" />
                    Usos
                  </div>
                  <div className="text-2xl font-black text-white">{selectedAgent.usageCount || 0}</div>
                </div>
                <div className="bg-cap-black p-4 rounded-lg border border-cap-gray">
                  <div className="flex items-center gap-2 text-cap-red font-bold mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Estado
                  </div>
                  <div className="text-2xl font-black text-white">
                    {selectedAgent.active ? 'Activo' : 'Inactivo'}
                  </div>
                </div>
              </div>

              {/* Criterios de Evaluación */}
              <div className="bg-cap-black p-4 rounded-lg border border-cap-gray">
                <h3 className="font-black text-cap-red mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Criterios de Evaluación (Total: 100 puntos)
                </h3>
                <div className="space-y-3">
                  {Object.entries(selectedAgent.criteria).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-cap-gray-dark rounded-lg">
                      <span className="font-bold text-cap-gray-lightest capitalize">
                        {key === 'experience' && '💼 Experiencia'}
                        {key === 'technicalSkills' && '⚙️ Skills Técnicas'}
                        {key === 'education' && '🎓 Educación'}
                        {key === 'softSkills' && '🤝 Skills Blandas'}
                        {key === 'careerProgression' && '📈 Progresión'}
                      </span>
                      <span className="text-2xl font-black text-cap-red">{value.weight} pts</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Umbrales */}
              <div className="bg-cap-black p-4 rounded-lg border border-cap-gray">
                <h3 className="font-black text-cap-red mb-4">Umbrales de Clasificación</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-racing-gradient rounded-lg">
                    <div className="text-sm font-bold text-white mb-1">Ideal</div>
                    <div className="text-xl font-black text-white">≥{selectedAgent.thresholds.ideal}</div>
                  </div>
                  <div className="text-center p-3 bg-cap-gray rounded-lg">
                    <div className="text-sm font-bold text-white mb-1">Potencial</div>
                    <div className="text-xl font-black text-white">≥{selectedAgent.thresholds.potential}</div>
                  </div>
                  <div className="text-center p-3 bg-cap-gray-dark rounded-lg border border-cap-gray">
                    <div className="text-sm font-bold text-cap-gray-lightest mb-1">Revisar</div>
                    <div className="text-xl font-black text-white">≥{selectedAgent.thresholds.review}</div>
                  </div>
                </div>
              </div>

              {/* Prompt del Sistema */}
              <div className="bg-cap-black p-4 rounded-lg border border-cap-gray">
                <h3 className="font-black text-cap-red mb-2">Prompt del Sistema</h3>
                <div className="text-xs text-cap-gray-lightest font-mono bg-cap-gray-darkest p-3 rounded border border-cap-gray max-h-60 overflow-y-auto">
                  {selectedAgent.systemPrompt}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
