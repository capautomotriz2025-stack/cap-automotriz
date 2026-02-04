'use client';

import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { getClassificationColor, getScoreColor, getStatusColor } from '@/lib/utils';
import { Search, Mail, Phone, FileText, Trash2, AlertTriangle, X, ChevronLeft, ChevronRight, Filter, Download, Eye, Loader2, MessageSquare, Award } from 'lucide-react';

export default function CandidatesPage() {
  const [candidates, setcandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [generatingCV, setGeneratingCV] = useState<string | null>(null);
  const [generatingInterview, setGeneratingInterview] = useState<string | null>(null);
  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [candidateForScore, setCandidateForScore] = useState<any>(null);
  const [psychometricScore, setPsychometricScore] = useState('');
  const [savingScore, setSavingScore] = useState(false);
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Filtros
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterClassification, setFilterClassification] = useState('all');

  useEffect(() => {
    fetchCandidates();
  }, []);

  // Filtrado y paginación
  const filteredAndPaginatedCandidates = useMemo(() => {
    let filtered = candidates;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por estado
    if (filterStatus !== 'all') {
      filtered = filtered.filter(c => c.status === filterStatus);
    }

    // Filtro por clasificación
    if (filterClassification !== 'all') {
      filtered = filtered.filter(c => c.aiClassification === filterClassification);
    }

    // Calcular paginación
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginated = filtered.slice(startIndex, endIndex);

    return { filtered, paginated, totalCount: filtered.length };
  }, [candidates, searchTerm, filterStatus, filterClassification, currentPage]);

  const totalPages = Math.ceil(filteredAndPaginatedCandidates.totalCount / itemsPerPage);

  // Reset a página 1 cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterClassification]);

  const fetchCandidates = async () => {
    try {
      const response = await axios.get('/api/candidates');
      if (response.data.success) {
        // Normalizar datos para ser compatibles con ambos formatos
        const normalizedCandidates = response.data.data.map((c: any) => ({
          ...c,
          aiScore: c.aiAnalysis?.score || c.aiScore || 0,
          aiClassification: c.aiAnalysis?.classification || c.aiClassification || 'potential',
          aiJustification: c.aiAnalysis?.summary || c.aiJustification || '',
          cvUrl: c.cvPath || c.cvUrl || '#'
        }));
        
        setcandidates(normalizedCandidates);
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (candidate: any) => {
    setCandidateToDelete(candidate);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!candidateToDelete) return;

    setIsDeleting(true);
    try {
      await axios.delete(`/api/candidates/${candidateToDelete._id}`);
      setcandidates(candidates.filter(c => c._id !== candidateToDelete._id));
      setDeleteModalOpen(false);
      setCandidateToDelete(null);
    } catch (error) {
      console.error('Error al eliminar el candidato:', error);
      alert('Error al eliminar el candidato');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cap-red"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white">Candidatos</h1>
        <p className="text-cap-gray-lightest mt-2 font-semibold">
          Gestiona y evalúa todos los candidatos
        </p>
      </div>

      {/* Filtros y Búsqueda */}
      <Card className="border-2 border-cap-gray bg-cap-gray-dark/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-cap-red" />
            <span className="text-sm font-bold text-white uppercase">Filtros</span>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-cap-gray" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-cap-black border-cap-gray text-white placeholder:text-cap-gray focus:border-cap-red font-semibold"
          />
        </div>

            {/* Filtro por Estado */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border-2 border-cap-gray rounded-md bg-cap-black text-white font-bold focus:border-cap-red"
            >
              <option value="all">📋 Todos los Estados</option>
              <option value="applied">📝 Aplicado</option>
              <option value="screening">🔍 Screening</option>
              <option value="interview">💬 Entrevista</option>
              <option value="evaluation">📊 Evaluación</option>
              <option value="offer">💼 Oferta</option>
              <option value="hired">✅ Contratado</option>
              <option value="rejected">❌ Rechazado</option>
            </select>

            {/* Filtro por Clasificación IA */}
            <select
              value={filterClassification}
              onChange={(e) => setFilterClassification(e.target.value)}
              className="px-4 py-2 border-2 border-cap-gray rounded-md bg-cap-black text-white font-bold focus:border-cap-red"
            >
              <option value="all">🤖 Todas las Clasificaciones</option>
              <option value="ideal">⭐ Ideal</option>
              <option value="potencial">💡 Potencial</option>
              <option value="no perfila">⚠️ No Perfila</option>
            </select>
      </div>
          
          {/* Resumen de filtros */}
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-cap-gray-lightest font-semibold">
              Mostrando {filteredAndPaginatedCandidates.paginated.length} de {filteredAndPaginatedCandidates.totalCount} candidatos
            </p>
            {(filterStatus !== 'all' || filterClassification !== 'all' || searchTerm) && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterClassification('all');
                }}
                className="border-cap-red text-cap-red hover:bg-cap-red hover:text-white font-bold text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                Limpiar Filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Candidates List */}
      {filteredAndPaginatedCandidates.totalCount === 0 ? (
        <Card className="bg-cap-gray-dark/80 backdrop-blur-sm border-2 border-cap-gray">
          <CardContent className="py-16 text-center">
            <p className="text-cap-gray-lightest font-semibold text-lg">
              {searchTerm || filterStatus !== 'all' || filterClassification !== 'all' ? 'No se encontraron candidatos con estos filtros' : 'No hay candidatos registrados'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
        <div className="space-y-4">
            {filteredAndPaginatedCandidates.paginated.map((candidate) => (
            <Card key={candidate._id} className="bg-cap-gray-dark/80 backdrop-blur-sm border-2 border-cap-gray hover:border-cap-red hover:shadow-racing transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-black text-white">{candidate.fullName}</h3>
                        <p className="text-sm text-cap-gray-lightest font-semibold">
                          {candidate.vacancyId?.title || 'Vacante no disponible'}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className={`text-2xl font-black ${getScoreColor(candidate.aiScore)}`}>
                            {candidate.aiScore}
                          </div>
                          <div className="text-xs text-cap-gray-lightest font-bold">Puntaje IA</div>
                        </div>
                        {candidate.genericCV?.technicalTestScore !== undefined && (
                          <div className="text-right">
                            <div className={`text-2xl font-black ${getScoreColor(candidate.genericCV.technicalTestScore)}`}>
                              {candidate.genericCV.technicalTestScore}
                            </div>
                            <div className="text-xs text-cap-gray-lightest font-bold">Psicotécnico</div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge className={`${getStatusColor(candidate.status)} font-bold border`}>
                        {candidate.status}
                      </Badge>
                      <Badge className={`${getClassificationColor(candidate.aiClassification)} text-white font-bold border`}>
                        {candidate.aiClassification}
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2 text-cap-gray-lightest font-semibold">
                        <Mail className="w-4 h-4 text-cap-gray" />
                        {candidate.email}
                      </div>
                      <div className="flex items-center gap-2 text-cap-gray-lightest font-semibold">
                        <Phone className="w-4 h-4 text-cap-gray" />
                        {candidate.phone}
                      </div>
                    </div>

                    {candidate.aiJustification && (
                      <p className="text-sm text-cap-gray-lightest italic font-semibold bg-cap-black p-3 rounded-lg border border-cap-gray">
                        {candidate.aiJustification}
                      </p>
                    )}

                    <div className="flex gap-2 pt-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCandidateForScore(candidate);
                          setPsychometricScore(candidate.genericCV?.technicalTestScore?.toString() || '');
                          setScoreModalOpen(true);
                        }}
                        className="border-2 border-cap-gray text-cap-gray-lightest hover:border-cap-red hover:text-cap-red font-bold transition-all"
                      >
                        <Award className="w-4 h-4 mr-2" />
                        Promedio Técnico
                      </Button>
                      <a
                        href={candidate.cvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm" className="border-2 border-cap-gray text-cap-gray-lightest hover:border-cap-red hover:text-cap-red font-bold transition-all">
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Original
                        </Button>
                      </a>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          if (!candidate.genericCV || !candidate.genericCV.pdfUrl) {
                            setGeneratingCV(candidate._id);
                            try {
                              const response = await axios.post(`/api/candidates/${candidate._id}/generate-cv`);
                              if (response.data.success) {
                                // Actualizar el candidato en la lista
                                const updatedCandidates = candidates.map(c => 
                                  c._id === candidate._id 
                                    ? { ...c, genericCV: response.data.data }
                                    : c
                                );
                                setcandidates(updatedCandidates);
                                // Abrir el CV genérico
                                if (response.data.data.pdfUrl) {
                                  window.open(response.data.data.pdfUrl, '_blank');
                                }
                              }
                            } catch (error) {
                              console.error('Error generando CV genérico:', error);
                              alert('Error al generar CV genérico');
                            } finally {
                              setGeneratingCV(null);
                            }
                          } else {
                            // Si ya existe, solo abrirlo
                            window.open(candidate.genericCV.pdfUrl, '_blank');
                          }
                        }}
                        disabled={generatingCV === candidate._id}
                        className="border-2 border-cap-gray text-cap-gray-lightest hover:border-cap-red hover:text-cap-red font-bold transition-all disabled:opacity-50"
                      >
                        {generatingCV === candidate._id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generando...
                          </>
                        ) : (
                          <>
                            <FileText className="w-4 h-4 mr-2" />
                            Ver Genérico
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          // Si no existe el PDF, generarlo primero
                          if (!candidate.genericCV?.pdfUrl) {
                            setGeneratingCV(candidate._id);
                            try {
                              const response = await axios.post(`/api/candidates/${candidate._id}/generate-cv`);
                              if (response.data.success && response.data.data.pdfUrl) {
                                // Descargar el archivo usando fetch para obtener el blob
                                const pdfUrl = response.data.data.pdfUrl;
                                const pdfResponse = await fetch(pdfUrl);
                                const blob = await pdfResponse.blob();
                                const url = window.URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = `CV-Generico-${candidate.fullName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                window.URL.revokeObjectURL(url);
                                
                                // Actualizar el candidato
                                const updatedCandidates = candidates.map(c => 
                                  c._id === candidate._id 
                                    ? { ...c, genericCV: response.data.data }
                                    : c
                                );
                                setcandidates(updatedCandidates);
                              }
                            } catch (error) {
                              console.error('Error generando CV genérico:', error);
                              alert('Error al generar CV genérico');
                            } finally {
                              setGeneratingCV(null);
                            }
                          } else {
                            // Si ya existe, descargarlo usando fetch para obtener el blob
                            try {
                              const pdfResponse = await fetch(candidate.genericCV.pdfUrl);
                              const blob = await pdfResponse.blob();
                              const url = window.URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = `CV-Generico-${candidate.fullName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              window.URL.revokeObjectURL(url);
                            } catch (error) {
                              console.error('Error descargando CV genérico:', error);
                              alert('Error al descargar CV genérico');
                            }
                          }
                        }}
                        disabled={generatingCV === candidate._id}
                        className="border-2 border-cap-gray text-cap-gray-lightest hover:border-cap-red hover:text-cap-red font-bold transition-all disabled:opacity-50"
                      >
                        {generatingCV === candidate._id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generando...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Descargar
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async (e) => {
                          e.stopPropagation();
                          setGeneratingInterview(candidate._id);
                          try {
                            const response = await axios.post(`/api/candidates/${candidate._id}/generate-interview`);
                            if (response.data.success && response.data.data.pdfUrl) {
                              window.open(response.data.data.pdfUrl, '_blank');
                            } else {
                              alert('Error al generar la entrevista');
                            }
                          } catch (error: any) {
                            console.error('Error generando entrevista:', error);
                            alert(error.response?.data?.error || 'Error al generar entrevista');
                          } finally {
                            setGeneratingInterview(null);
                          }
                        }}
                        disabled={generatingInterview === candidate._id}
                        className="border-2 border-cap-gray text-cap-gray-lightest hover:border-cap-red hover:text-cap-red font-bold transition-all disabled:opacity-50"
                      >
                        {generatingInterview === candidate._id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generando...
                          </>
                        ) : (
                          <>
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Generar Entrevista
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openDeleteModal(candidate)}
                        className="border-2 border-cap-red text-cap-red hover:bg-cap-red hover:text-white font-bold transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <Card className="mt-6 border-2 border-cap-gray bg-cap-gray-dark/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-cap-gray-lightest font-semibold">
                    Página {currentPage} de {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="border-2 border-cap-gray text-cap-gray-lightest hover:border-cap-red hover:text-cap-red disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Anterior
                    </Button>
                    
                    {/* Números de página */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-10 h-10 p-0 ${
                              currentPage === pageNum 
                                ? 'bg-racing-gradient text-white border-cap-red shadow-racing font-black' 
                                : 'border-2 border-cap-gray text-cap-gray-lightest hover:border-cap-red hover:text-cap-red font-bold'
                            } transition-all`}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="border-2 border-cap-gray text-cap-gray-lightest hover:border-cap-red hover:text-cap-red disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all"
                    >
                      Siguiente
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Modal para Promedio Técnico (Psicotécnico) */}
      <Dialog open={scoreModalOpen} onOpenChange={setScoreModalOpen}>
        <DialogContent className="bg-cap-gray-dark border-2 border-cap-red text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-white">
              Promedio Técnico - Prueba Psicotécnica
            </DialogTitle>
            <DialogDescription className="text-cap-gray-lightest font-semibold text-base mt-4">
              {candidateForScore && (
                <>
                  <p className="mb-4">Ingresa el puntaje de la prueba psicotécnica para:</p>
                  <div className="p-4 bg-cap-black rounded-lg border border-cap-gray">
                    <p className="font-bold text-white text-lg mb-1">{candidateForScore.fullName}</p>
                    <p className="text-sm text-cap-gray-lightest">{candidateForScore.email}</p>
                  </div>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <label className="block text-sm font-bold text-white mb-2">
              Puntaje Psicotécnico (0-100)
            </label>
            <Input
              type="number"
              min="0"
              max="100"
              value={psychometricScore}
              onChange={(e) => setPsychometricScore(e.target.value)}
              placeholder="Ej: 85"
              className="bg-cap-black border-2 border-cap-gray text-white placeholder:text-cap-gray focus:border-cap-red font-semibold"
            />
            <p className="text-xs text-cap-gray-lightest mt-2 font-semibold">
              Este puntaje se agregará al CV genérico del candidato
            </p>
          </div>
          <DialogFooter className="mt-6 flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setScoreModalOpen(false);
                setCandidateForScore(null);
                setPsychometricScore('');
              }}
              disabled={savingScore}
              className="flex-1 border-2 border-cap-gray text-cap-gray-lightest hover:border-cap-red hover:text-cap-red font-bold transition-all"
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                const score = parseInt(psychometricScore);
                if (isNaN(score) || score < 0 || score > 100) {
                  alert('Por favor ingresa un puntaje válido entre 0 y 100');
                  return;
                }

                setSavingScore(true);
                try {
                  // Primero actualizar el candidato con el puntaje psicotécnico
                  const updateResponse = await axios.put(`/api/candidates/${candidateForScore._id}`, {
                    genericCV: {
                      ...candidateForScore.genericCV,
                      technicalTestScore: score,
                      summary: candidateForScore.genericCV?.summary || [],
                      generatedAt: candidateForScore.genericCV?.generatedAt || new Date(),
                      pdfUrl: candidateForScore.genericCV?.pdfUrl
                    }
                  });

                  if (updateResponse.data.success) {
                    // Regenerar el CV genérico con el nuevo puntaje psicotécnico
                    const cvResponse = await axios.post(`/api/candidates/${candidateForScore._id}/generate-cv`);
                    
                    if (cvResponse.data.success) {
                      // Actualizar el candidato en la lista con el CV regenerado
                      const updatedCandidates = candidates.map(c => 
                        c._id === candidateForScore._id 
                          ? { ...c, genericCV: cvResponse.data.data }
                          : c
                      );
                      setcandidates(updatedCandidates);
                      setScoreModalOpen(false);
                      setCandidateForScore(null);
                      setPsychometricScore('');
                      alert('Puntaje guardado y CV genérico regenerado exitosamente');
                    } else {
                      // Si falla la regeneración, al menos guardar el puntaje
                      const updatedCandidates = candidates.map(c => 
                        c._id === candidateForScore._id 
                          ? { ...c, genericCV: updateResponse.data.data.genericCV }
                          : c
                      );
                      setcandidates(updatedCandidates);
                      alert('Puntaje guardado, pero hubo un error al regenerar el CV genérico');
                    }
                  } else {
                    alert('Error al guardar el puntaje');
                  }
                } catch (error: any) {
                  console.error('Error guardando puntaje:', error);
                  alert(error.response?.data?.error || 'Error al guardar el puntaje');
                } finally {
                  setSavingScore(false);
                }
              }}
              disabled={savingScore}
              className="flex-1 bg-cap-red hover:bg-cap-red-dark text-white font-black transition-all hover:scale-105"
            >
              {savingScore ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Award className="mr-2 h-4 w-4" />
                  Guardar Puntaje
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmación de Eliminación */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="bg-cap-gray-dark border-2 border-cap-red text-white max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-cap-red/20 rounded-full flex items-center justify-center border-2 border-cap-red">
                  <AlertTriangle className="w-6 h-6 text-cap-red" />
                </div>
                <DialogTitle className="text-2xl font-black text-white">
                  ¿Eliminar Candidato?
                </DialogTitle>
              </div>
            </div>
            <DialogDescription className="text-cap-gray-lightest font-semibold text-base mt-4">
              {candidateToDelete && (
                <>
                  Estás a punto de eliminar al candidato:
                  <div className="mt-3 p-4 bg-cap-black rounded-lg border border-cap-gray">
                    <p className="font-bold text-white text-lg mb-1">{candidateToDelete.fullName}</p>
                    <p className="text-sm text-cap-gray-lightest mb-2">{candidateToDelete.email}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge className={`${getStatusColor(candidateToDelete.status)} font-bold border`}>
                        {candidateToDelete.status}
                      </Badge>
                      <Badge className={`${getClassificationColor(candidateToDelete.aiClassification)} text-white font-bold border`}>
                        {candidateToDelete.aiClassification}
                      </Badge>
                      <Badge className="bg-cap-gray text-cap-gray-lightest border border-cap-gray font-bold">
                        Score: {candidateToDelete.aiScore}
                      </Badge>
                    </div>
                  </div>
                  <p className="mt-4 text-cap-red font-bold">
                    ⚠️ Esta acción no se puede deshacer
                  </p>
                  <p className="text-sm text-cap-gray-lightest mt-2">
                    Se eliminarán todos los datos del candidato, incluyendo su CV y evaluaciones.
                  </p>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex gap-3">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              disabled={isDeleting}
              className="flex-1 border-2 border-cap-gray text-cap-gray-lightest hover:border-cap-red hover:text-cap-red font-bold transition-all"
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 bg-cap-red hover:bg-cap-red-dark text-white font-black transition-all hover:scale-105"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Sí, Eliminar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

