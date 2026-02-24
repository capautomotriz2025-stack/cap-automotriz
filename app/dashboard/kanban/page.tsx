'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCw, Search } from 'lucide-react';

export default function KanbanPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await axios.get('/api/candidates');
      if (response.data.success) {
        // Normalizar datos para ambos formatos
        const normalizedCandidates = response.data.data.map((c: any) => ({
          ...c,
          aiScore: c.aiAnalysis?.score || c.aiScore || 0,
          aiClassification: c.aiAnalysis?.classification || c.aiClassification || 'potential',
        }));
        setCandidates(normalizedCandidates);
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (candidateId: string, newStatus: string) => {
    try {
      const response = await axios.put(`/api/candidates/${candidateId}`, {
        status: newStatus
      });

      if (response.data.success) {
        // Update local state
        setCandidates(candidates.map(c =>
          c._id === candidateId ? { ...c, status: newStatus } : c
        ));
      }
    } catch (error) {
      console.error('Error updating candidate status:', error);
      alert('Error al actualizar el estado del candidato');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-lg">Cargando tablero...</div>
      </div>
    );
  }

  const filteredCandidates = searchTerm.trim()
    ? candidates.filter((c) => {
        const v = c.vacancyId;
        const title = (v && v.title) || '';
        const dept = (v && v.department) || '';
        const term = searchTerm.toLowerCase();
        return title.toLowerCase().includes(term) || dept.toLowerCase().includes(term);
      })
    : candidates;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-black text-white">Tablero Kanban</h1>
          <p className="text-cap-gray-lightest mt-2 font-semibold">
            Arrastra y suelta candidatos para actualizar su estado
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por plaza o departamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-background border-cap-gray text-cap-gray-lightest"
            />
          </div>
          <Button variant="outline" onClick={fetchCandidates} className="border-cap-gray text-cap-gray-lightest hover:border-cap-red hover:text-cap-red font-bold shrink-0">
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      {filteredCandidates.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          {candidates.length === 0
            ? 'No hay candidatos para mostrar'
            : 'Ningún candidato coincide con la búsqueda'}
        </div>
      ) : (
        <KanbanBoard
          candidates={filteredCandidates}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}

