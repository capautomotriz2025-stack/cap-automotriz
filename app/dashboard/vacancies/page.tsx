'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, MapPin, DollarSign, Edit, Trash2, Eye, AlertTriangle, X, Search } from 'lucide-react';
import { formatCurrency, getStatusColor } from '@/lib/utils';

export default function VacanciesPage() {
  const [vacancies, setVacancies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [vacancyToDelete, setVacancyToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVacancies();
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

  // Filtrar vacantes por búsqueda
  const filteredVacancies = vacancies.filter(vacancy => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      vacancy.title?.toLowerCase().includes(search) ||
      vacancy.department?.toLowerCase().includes(search) ||
      vacancy.costCenter?.toLowerCase().includes(search) ||
      vacancy.requiredProfession?.toLowerCase().includes(search) ||
      vacancy.applicantName?.toLowerCase().includes(search)
    );
  });

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

      {/* Tabla de Solicitudes */}
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
                  <th className="px-4 py-3 text-left text-sm font-black text-white">Proceso Aprobado</th>
                  <th className="px-4 py-3 text-left text-sm font-black text-white">Comentarios</th>
                  <th className="px-4 py-3 text-left text-sm font-black text-white">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredVacancies.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="px-4 py-20 text-center text-cap-gray-lightest font-semibold">
                      {searchTerm ? 'No se encontraron solicitudes con ese criterio' : 'No hay solicitudes registradas'}
                    </td>
                  </tr>
                ) : (
                  filteredVacancies.map((vacancy) => (
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
                        {vacancy.positionScale === 'escala-uno-gerentes' ? 'Escala Uno - Gerentes' :
                         vacancy.positionScale === 'escala-dos-jefes-coordinadores' ? 'Escala Dos - Jefes y Coordinadores' :
                         vacancy.positionScale === 'escala-tres-especialistas' ? 'Escala Tres - Especialistas' :
                         vacancy.positionScale === 'escala-cuatro-oficiales-auxiliares' ? 'Escala Cuatro - Oficiales y Auxiliares' :
                         vacancy.positionScale || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-cap-gray-lightest font-semibold">
                        <Badge variant="outline" className="border-cap-gray text-cap-gray-lightest font-bold">
                          {vacancy.status === 'published' ? 'Activo' : 'Pendiente'}
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
                        <Badge className={`${vacancy.status === 'published' ? 'bg-green-500' : vacancy.status === 'draft' ? 'bg-yellow-500' : 'bg-gray-500'} text-white font-bold`}>
                          {vacancy.status === 'published' ? 'Aprobado' : vacancy.status === 'draft' ? 'Pendiente' : 'Cerrado'}
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
        </CardContent>
      </Card>


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
                        {vacancyToDelete.status === 'published' ? 'Publicada' : vacancyToDelete.status === 'draft' ? 'Borrador' : 'Cerrada'}
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

