'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, MapPin, DollarSign, Edit, Trash2, Eye, AlertTriangle, X } from 'lucide-react';
import { formatCurrency, getStatusColor } from '@/lib/utils';

export default function VacanciesPage() {
  const [vacancies, setVacancies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [vacancyToDelete, setVacancyToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
            Nueva Vacante
          </Button>
        </Link>
      </div>

      {/* Vacancies List */}
      {vacancies.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-gray-500 mb-4">No hay vacantes creadas</p>
            <Link href="/dashboard/vacancies/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Crear Primera Vacante
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {vacancies.map((vacancy) => (
            <Card key={vacancy._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-lg line-clamp-1">
                    {vacancy.title}
                  </CardTitle>
                  <Badge className={getStatusColor(vacancy.status)}>
                    {vacancy.status === 'draft' && 'Borrador'}
                    {vacancy.status === 'published' && 'Publicada'}
                    {vacancy.status === 'closed' && 'Cerrada'}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {vacancy.department}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {vacancy.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2" />
                    {formatCurrency(vacancy.salary.min)} - {formatCurrency(vacancy.salary.max)}
                  </div>
                  
                  {vacancy.requiredSkills && vacancy.requiredSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2">
                      {vacancy.requiredSkills.slice(0, 3).map((skill: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {vacancy.requiredSkills.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{vacancy.requiredSkills.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t">
                    <Link href={`/apply/${vacancy._id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                    </Link>
                    <Link href={`/dashboard/vacancies/${vacancy._id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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

