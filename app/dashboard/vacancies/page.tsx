'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, MapPin, DollarSign, Edit, Trash2, Eye, AlertTriangle, X, Search, Table, Grid, ChevronLeft, ChevronRight, Building2, Clock, RefreshCw } from 'lucide-react';
import { formatCurrency, getStatusColor } from '@/lib/utils';

type ViewMode = 'table' | 'cards';

export default function VacanciesPage() {
  const [vacancies, setVacancies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [vacancyToDelete, setVacancyToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [timecvModalOpen, setTimecvModalOpen] = useState(false);
  const [vacancyToUpdateTimecv, setVacancyToUpdateTimecv] = useState<any>(null);
  const [selectedTimecv, setSelectedTimecv] = useState<string>('');
  const [isUpdatingTimecv, setIsUpdatingTimecv] = useState(false);

  useEffect(() => {
    fetchVacancies();
  }, []);

  // Detectar filtro de URL para procesos activos
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const filter = urlParams.get('filter');
      if (filter === 'active') {
        // El filtro se aplicará en filteredVacancies
      }
    }
  }, []);

  const fetchVacancies = async () => {
    try {
      const response = await axios.get('/api/vacancies');
      if (response.data.success) {
        setVacancies(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching vacancies:', error);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (vacancy: any) => {
    setVacancyToDelete(vacancy);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!vacancyToDelete) return;

    setIsDeleting(true);
    try {
      await axios.delete(`/api/vacancies/${vacancyToDelete._id}`);
      setVacancies(vacancies.filter(v => v._id !== vacancyToDelete._id));
      setDeleteModalOpen(false);
      setVacancyToDelete(null);
    } catch (error) {
      console.error('Error al eliminar la vacante:', error);
      alert('Error al eliminar la vacante');
    } finally {
      setIsDeleting(false);
    }
  };

  const openTimecvModal = (vacancy: any) => {
    setVacancyToUpdateTimecv(vacancy);
    setSelectedTimecv(vacancy.timecv || '');
    setTimecvModalOpen(true);
  };

  const handleUpdateTimecv = async () => {
    if (!vacancyToUpdateTimecv || !selectedTimecv) return;

    setIsUpdatingTimecv(true);
    try {
      const response = await axios.put(`/api/vacancies/${vacancyToUpdateTimecv._id}/update-timecv`, {
        timecv: selectedTimecv
      });

      if (response.data.success) {
        // Actualizar la vacante en el estado
        setVacancies(vacancies.map(v => 
          v._id === vacancyToUpdateTimecv._id 
            ? { ...v, timecv: selectedTimecv, timecvExpiresAt: response.data.data.timecvExpiresAt }
            : v
        ));
        setTimecvModalOpen(false);
        setVacancyToUpdateTimecv(null);
        setSelectedTimecv('');
        alert('Tiempo de recepción de CVs actualizado exitosamente');
      }
    } catch (error: any) {
      console.error('Error al actualizar tiempo:', error);
      alert(error.response?.data?.error || 'Error al actualizar el tiempo de recepción de CVs');
    } finally {
      setIsUpdatingTimecv(false);
    }
  };

  // Filtrar vacantes por búsqueda y estado activo
  const filteredVacancies = useMemo(() => {
    let filtered = vacancies;
    
    // Filtrar por estado activo si viene en la URL
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const filter = urlParams.get('filter');
      if (filter === 'active') {
        filtered = filtered.filter(v => v.status === 'published' || v.status === 'draft');
      }
    }
    
    // Filtrar por búsqueda
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(vacancy =>
        vacancy.title?.toLowerCase().includes(search) ||
        vacancy.department?.toLowerCase().includes(search) ||
        vacancy.costCenter?.toLowerCase().includes(search) ||
        vacancy.requiredProfession?.toLowerCase().includes(search) ||
        vacancy.applicantName?.toLowerCase().includes(search)
      );
    }
    
    return filtered;
  }, [vacancies, searchTerm]);

  // Paginación
  const totalPages = Math.ceil(filteredVacancies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedVacancies = filteredVacancies.slice(startIndex, endIndex);

  // Reset a página 1 cuando cambia la búsqueda o el modo de vista
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, viewMode]);

  if (loading) {
    return <div className="animate-pulse">Cargando vacantes...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white">Vacantes</h1>
          <p className="text-cap-gray-lightest mt-2 font-semibold">
            Gestiona todas las posiciones disponibles
          </p>
        </div>
        <Link href="/dashboard/vacancies/new">
          <Button className="bg-racing-gradient hover:scale-105 transition-transform shadow-racing font-bold">
            <Plus className="mr-2 h-4 w-4" />
            Crear Vacante
          </Button>
        </Link>
      </div>

      {/* Card de Solicitudes */}
      <Card className="border-2 border-cap-gray bg-cap-gray-dark/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-black text-white">Solicitudes de Recursos Humanos</CardTitle>
              <CardDescription className="text-cap-gray-lightest font-semibold mt-1">
                Lista de todas las solicitudes de vacantes
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {/* Toggle de Vista */}
              <div className="flex items-center gap-2 border-2 border-cap-gray rounded-lg p-1 bg-cap-black">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('cards')}
                  className={`${viewMode === 'cards' ? 'bg-racing-gradient text-white' : 'text-cap-gray-lightest hover:text-white'} font-bold`}
                >
                  <Grid className="w-4 h-4 mr-1" />
                  Cajas
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className={`${viewMode === 'table' ? 'bg-racing-gradient text-white' : 'text-cap-gray-lightest hover:text-white'} font-bold`}
                >
                  <Table className="w-4 h-4 mr-1" />
                  Tabla
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cap-gray" />
                <Input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 border-2 border-cap-gray bg-cap-black text-white placeholder:text-cap-gray"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cap-gray bg-cap-black">
                    <th className="px-4 py-3 text-left text-sm font-black text-white">
                      <input type="checkbox" className="rounded" />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-black text-white">Nombre de Puesto</th>
                    <th className="px-4 py-3 text-left text-sm font-black text-white">Nuevo Puesto</th>
                    <th className="px-4 py-3 text-left text-sm font-black text-white">Departamento</th>
                    <th className="px-4 py-3 text-left text-sm font-black text-white">Centro de Costos</th>
                    <th className="px-4 py-3 text-left text-sm font-black text-white">Profesión</th>
                    <th className="px-4 py-3 text-left text-sm font-black text-white">Fecha de Solicitud</th>
                    <th className="px-4 py-3 text-left text-sm font-black text-white">Escala de Puesto</th>
                    <th className="px-4 py-3 text-left text-sm font-black text-white">SLA</th>
                    <th className="px-4 py-3 text-left text-sm font-black text-white">Nivel de Evaluación</th>
                    <th className="px-4 py-3 text-left text-sm font-black text-white">Descriptor de Puesto</th>
                    <th className="px-4 py-3 text-left text-sm font-black text-white">Asignar tiempo al proceso</th>
                    <th className="px-4 py-3 text-left text-sm font-black text-white">Proceso Aprobado</th>
                    <th className="px-4 py-3 text-left text-sm font-black text-white">Comentarios</th>
                    <th className="px-4 py-3 text-left text-sm font-black text-white">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedVacancies.length === 0 ? (
                    <tr>
                      <td colSpan={15} className="px-4 py-20 text-center text-cap-gray-lightest font-semibold">
                        {searchTerm ? 'No se encontraron solicitudes con ese criterio' : 'No hay solicitudes registradas'}
                      </td>
                    </tr>
                  ) : (
                    paginatedVacancies.map((vacancy) => (
                      <tr key={vacancy._id} className="border-b border-cap-gray hover:bg-cap-gray-dark transition-colors">
                        <td className="px-4 py-3">
                          <input type="checkbox" className="rounded" />
                        </td>
                        <td className="px-4 py-3 text-sm text-white font-bold">{vacancy.title || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-cap-gray-lightest font-semibold">
                          {vacancy.isNewPosition ? 'Sí' : 'No'}
                        </td>
                        <td className="px-4 py-3 text-sm text-cap-gray-lightest font-semibold">{vacancy.department || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-cap-gray-lightest font-semibold">{vacancy.costCenter || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-cap-gray-lightest font-semibold">{vacancy.requiredProfession || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-cap-gray-lightest font-semibold">
                          {vacancy.createdAt ? new Date(vacancy.createdAt).toLocaleDateString('es-MX') : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-cap-gray-lightest font-semibold">
                          {vacancy.positionScale === '1' ? 'Auxiliar (1)' : vacancy.positionScale === '2' ? 'Oficial Junior (2)' :
                           vacancy.positionScale === '3' ? 'Oficial Senior (3)' : vacancy.positionScale === '4' ? 'Analista (4)' :
                           vacancy.positionScale === '4e' ? 'Especialista (4)' : vacancy.positionScale === '5' ? 'Coordinación (5)' :
                           vacancy.positionScale === '6' ? 'Jefatura (6)' : vacancy.positionScale === '7' ? 'Subgerencia (7)' :
                           vacancy.positionScale === '8' ? 'Gerencia (8)' : vacancy.positionScale === '9' ? 'Director (9)' :
                           vacancy.positionScale || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-cap-gray-lightest font-semibold">
                          <Badge variant="outline" className="border-cap-gray text-cap-gray-lightest font-bold">
                            {vacancy.status === 'published' ? 'Activo' : vacancy.status === 'pending' ? 'Pendiente' : 'Pendiente'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-cap-gray-lightest font-semibold capitalize">{vacancy.evaluationLevel || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm">
                          {vacancy.jobDescriptorFile ? (
                            <a
                              href={vacancy.jobDescriptorFile}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cap-red hover:text-cap-red-dark font-bold hover:underline"
                            >
                              Ver Archivo
                            </a>
                          ) : (
                            <span className="text-cap-gray font-semibold">Sin archivo</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex flex-col gap-1">
                            <span className="text-cap-gray-lightest font-semibold">
                              {vacancy.timecv || 'No configurado'}
                            </span>
                            {vacancy.timecvExpiresAt && (
                              <span className="text-xs text-cap-gray">
                                Expira: {new Date(vacancy.timecvExpiresAt).toLocaleDateString('es-MX')}
                              </span>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openTimecvModal(vacancy)}
                              className="mt-1 border-2 border-cap-gray text-cap-red hover:border-cap-red hover:text-cap-red font-bold transition-all text-xs"
                            >
                              <RefreshCw className="w-3 h-3 mr-1" />
                              Asignar tiempo al proceso
                            </Button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Badge className={`${vacancy.status === 'published' ? 'bg-green-500' : vacancy.status === 'draft' ? 'bg-yellow-500' : vacancy.status === 'pending' ? 'bg-orange-500' : 'bg-gray-500'} text-white font-bold`}>
                            {vacancy.status === 'published' ? 'Aprobado' : vacancy.status === 'draft' ? 'Borrador' : vacancy.status === 'pending' ? 'Pendiente' : 'Cerrado'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-cap-gray-lightest font-semibold max-w-xs truncate">
                          {vacancy.mainFunctions || vacancy.description || 'Sin comentarios'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Link href={`/dashboard/vacancies/${vacancy._id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-2 border-cap-gray text-cap-red hover:border-cap-red hover:text-cap-red font-bold transition-all"
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Editar
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDeleteModal(vacancy)}
                              className="border-2 border-cap-red text-cap-red hover:bg-cap-red hover:text-white font-bold transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedVacancies.length === 0 ? (
                  <div className="col-span-full text-center py-20 text-cap-gray-lightest font-semibold">
                    {searchTerm ? 'No se encontraron solicitudes con ese criterio' : 'No hay solicitudes registradas'}
                  </div>
                ) : (
                  paginatedVacancies.map((vacancy) => (
                    <Card 
                      key={vacancy._id} 
                      className="group border-2 border-cap-gray bg-cap-gray-dark/80 backdrop-blur-sm hover:shadow-racing-xl hover:border-cap-red transition-all duration-300 hover:-translate-y-1 flex flex-col"
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between mb-3">
                          <Badge className={`${
                            vacancy.status === 'published' ? 'bg-green-500' : 
                            vacancy.status === 'pending' ? 'bg-orange-500' : 
                            vacancy.status === 'draft' ? 'bg-yellow-500' : 
                            'bg-gray-500'
                          } text-white hover:bg-opacity-80 font-bold`}>
                            {vacancy.status === 'published' ? 'Aprobado' : 
                             vacancy.status === 'pending' ? 'Pendiente' : 
                             vacancy.status === 'draft' ? 'Borrador' : 
                             'Cerrado'}
                          </Badge>
                          <Badge variant="outline" className="capitalize border-2 border-cap-gray text-cap-gray-lightest font-bold">
                            {vacancy.employmentType === 'full-time' && 'Tiempo Completo'}
                            {vacancy.employmentType === 'part-time' && 'Medio Tiempo'}
                            {vacancy.employmentType === 'contract' && 'Contrato'}
                            {vacancy.employmentType === 'internship' && 'Prácticas'}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl leading-tight group-hover:text-cap-red transition-colors font-black text-white">
                          {vacancy.title || 'Sin título'}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Building2 className="w-4 h-4 text-cap-gray" />
                          <CardDescription className="text-base font-bold text-cap-gray-lightest">
                            {vacancy.department || 'N/A'}
                          </CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4 flex-1 flex flex-col">
                        <div className="space-y-2.5 flex-1">
                          {vacancy.location && (
                            <div className="flex items-center text-sm text-cap-gray-lightest">
                              <div className="w-8 h-8 bg-cap-black rounded-lg flex items-center justify-center mr-3">
                                <MapPin className="w-4 h-4 text-cap-gray" />
                              </div>
                              <span className="font-bold">{vacancy.location}</span>
                            </div>
                          )}
                          {vacancy.salary && vacancy.salary.min > 0 && (
                            <div className="flex items-center text-sm text-cap-gray-lightest">
                              <div className="w-8 h-8 bg-racing-gradient/20 rounded-lg flex items-center justify-center mr-3">
                                <DollarSign className="w-4 h-4 text-cap-red" />
                              </div>
                              <span className="font-bold">
                                {formatCurrency(vacancy.salary.min)} - {formatCurrency(vacancy.salary.max)}
                              </span>
                            </div>
                          )}
                          {vacancy.experienceYears > 0 && (
                            <div className="flex items-center text-sm text-cap-gray-lightest">
                              <div className="w-8 h-8 bg-cap-black rounded-lg flex items-center justify-center mr-3">
                                <Clock className="w-4 h-4 text-cap-gray" />
                              </div>
                              <span className="font-bold">{vacancy.experienceYears} años de experiencia</span>
                            </div>
                          )}
                          <div className="flex items-center text-sm text-cap-gray-lightest">
                            <span className="font-bold">Solicitante: {vacancy.applicantName || 'N/A'}</span>
                          </div>
                          <div className="flex items-center text-sm text-cap-gray-lightest">
                            <span className="font-bold">Centro de Costos: {vacancy.costCenter || 'N/A'}</span>
                          </div>
                          {vacancy.timecv && (
                            <div className="flex items-center text-sm text-cap-gray-lightest">
                              <div className="w-8 h-8 bg-cap-black rounded-lg flex items-center justify-center mr-3">
                                <Clock className="w-4 h-4 text-cap-gray" />
                              </div>
                              <div className="flex-1">
                                <span className="font-bold">Asignar tiempo al proceso: {vacancy.timecv}</span>
                                {vacancy.timecvExpiresAt && (
                                  <span className="text-xs text-cap-gray block">
                                    Expira: {new Date(vacancy.timecvExpiresAt).toLocaleDateString('es-MX')}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {vacancy.mainFunctions && (
                          <div className="pt-3 border-t border-cap-gray">
                            <p className="text-xs text-cap-gray-lightest line-clamp-2 font-semibold">
                              {vacancy.mainFunctions}
                            </p>
                          </div>
                        )}

                        <div className="pt-4 mt-auto space-y-2">
                          <div className="flex gap-2">
                            <Link href={`/dashboard/vacancies/${vacancy._id}`} className="flex-1">
                              <Button className="w-full border-2 border-cap-gray text-cap-red hover:border-cap-red hover:text-cap-red font-bold transition-all">
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              onClick={() => openDeleteModal(vacancy)}
                              className="border-2 border-cap-red text-cap-red hover:bg-cap-red hover:text-white font-bold transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => openTimecvModal(vacancy)}
                            className="w-full border-2 border-cap-gray text-cap-red hover:border-cap-red hover:text-cap-red font-bold transition-all"
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Asignar tiempo al proceso
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-cap-gray flex items-center justify-between">
              <div className="text-sm text-cap-gray-lightest font-semibold">
                Mostrando {startIndex + 1} - {Math.min(endIndex, filteredVacancies.length)} de {filteredVacancies.length} solicitudes
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="border-2 border-cap-gray text-cap-red hover:border-cap-red hover:text-cap-red disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all"
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
                            : 'border-2 border-cap-gray text-cap-red hover:border-cap-red hover:text-cap-red font-bold'
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
                  className="border-2 border-cap-gray text-cap-red hover:border-cap-red hover:text-cap-red disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Actualización de Tiempo CV */}
      <Dialog open={timecvModalOpen} onOpenChange={setTimecvModalOpen}>
        <DialogContent className="bg-cap-gray-dark border-2 border-cap-blue/30 text-white max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-cap-blue/20 rounded-full flex items-center justify-center border-2 border-cap-blue">
                <Clock className="w-6 h-6 text-cap-blue" />
              </div>
              <DialogTitle className="text-2xl font-black text-white">
                Asignar tiempo al proceso
              </DialogTitle>
            </div>
            <DialogDescription className="text-cap-gray-lightest font-semibold text-base mt-4">
              {vacancyToUpdateTimecv && (
                <>
                  <p className="mb-3">Vacante: <span className="text-white font-bold">{vacancyToUpdateTimecv.title}</span></p>
                  <p className="mb-4">Selecciona el nuevo tiempo de recepción de CVs para esta vacante:</p>
                  <div className="space-y-2">
                    <Label htmlFor="timecv-select" className="text-white font-bold">Tiempo de Recepción</Label>
                    <select
                      id="timecv-select"
                      value={selectedTimecv}
                      onChange={(e) => setSelectedTimecv(e.target.value)}
                      className="flex h-12 w-full rounded-md border-2 border-input bg-cap-black px-3 py-2 text-sm font-semibold text-white"
                    >
                      <option value="">Seleccione un tiempo...</option>
                      <option value="1 semana">1 semana</option>
                      <option value="1 mes">1 mes</option>
                      <option value="2 meses">2 meses</option>
                      <option value="3 meses">3 meses</option>
                      <option value="6 meses">6 meses</option>
                      <option value="1 año">1 año</option>
                    </select>
                    {selectedTimecv && (
                      <p className="text-sm text-cap-gray-lightest mt-2">
                        La fecha de expiración se calculará automáticamente desde la fecha de publicación.
                      </p>
                    )}
                  </div>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setTimecvModalOpen(false);
                setVacancyToUpdateTimecv(null);
                setSelectedTimecv('');
              }}
              disabled={isUpdatingTimecv}
              className="flex-1 border-2 border-cap-gray text-cap-gray-lightest hover:border-cap-red hover:text-cap-red font-bold transition-all"
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateTimecv}
              disabled={isUpdatingTimecv || !selectedTimecv}
              className="flex-1 bg-cap-blue hover:bg-cap-blue-dark text-white font-black transition-all hover:scale-105"
            >
              {isUpdatingTimecv ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Actualizando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Actualizar Tiempo
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
                  ¿Eliminar Vacante?
                </DialogTitle>
              </div>
            </div>
            <DialogDescription className="text-cap-gray-lightest font-semibold text-base mt-4">
              {vacancyToDelete && (
                <>
                  Estás a punto de eliminar la vacante:
                  <div className="mt-3 p-4 bg-cap-black rounded-lg border border-cap-gray">
                    <p className="font-bold text-white text-lg mb-1">{vacancyToDelete.title}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge className="bg-cap-gray text-cap-gray-lightest border border-cap-gray font-bold">
                        {vacancyToDelete.department}
                      </Badge>
                      <Badge className={`${getStatusColor(vacancyToDelete.status)} font-bold border`}>
                        {vacancyToDelete.status === 'published' ? 'Publicada' : vacancyToDelete.status === 'draft' ? 'Borrador' : vacancyToDelete.status === 'pending' ? 'Pendiente' : 'Cerrada'}
                      </Badge>
                    </div>
                  </div>
                  <p className="mt-4 text-cap-red font-bold">
                    ⚠️ Esta acción no se puede deshacer
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
