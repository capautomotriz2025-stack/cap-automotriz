'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Plus } from 'lucide-react';
import Link from 'next/link';

export default function RequestsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    applicantName: '',
    department: '',
    costCenter: '',
    isNewPosition: false,
    title: '', // Nombre de Puesto
    numberOfPositions: '1',
    positionScale: '',
    mainFunctions: '', // Describa Brevemente las Principales Funciones
    company: '', // Empresa
    contractType: '', // Tipo de contrato
    location: '', // Ubicación
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Crear solicitud básica con status 'pending' para que RH la complete
      const dataToSend = {
        applicantName: formData.applicantName,
        department: formData.department,
        costCenter: formData.costCenter,
        isNewPosition: formData.isNewPosition,
        title: formData.title,
        numberOfPositions: parseInt(formData.numberOfPositions) || 1,
        positionScale: formData.positionScale,
        mainFunctions: formData.mainFunctions,
        company: formData.company || undefined,
        contractType: formData.contractType || undefined,
        location: formData.location || 'Por definir', // Valor temporal, se completará en Vacantes
        // Campos mínimos requeridos por el modelo (valores por defecto)
        // evaluationLevel se completará en Vacantes (opcional)
        evaluationAreas: [], // Se completará en Vacantes
        salary: {
          min: 0,
          max: 0,
          currency: 'MXN'
        },
        // Mantener compatibilidad con campos legacy
        requiredProfession: '', // Se completará en Vacantes
        experienceYears: 0, // Se completará en Vacantes
        employmentType: 'full-time' as const,
        status: 'pending' as const, // Estado especial para solicitudes pendientes
      };

      const response = await axios.post('/api/vacancies', dataToSend);

      if (response.data.success) {
        alert('¡Solicitud creada exitosamente! Recursos Humanos la revisará y completará.');
        router.push('/dashboard/vacancies');
      }
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.response?.data?.error || 'Error al crear la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-black text-white">Nueva Solicitud</h1>
          <p className="text-cap-gray-lightest mt-1 font-semibold">
            Formulario básico de solicitud de recursos humanos
          </p>
        </div>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Información de Solicitud */}
        <Card>
          <CardHeader>
            <CardTitle>Información de Solicitud</CardTitle>
            <CardDescription>Datos básicos del solicitante y del puesto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="applicantName">Nombre de Solicitante *</Label>
                <Input
                  id="applicantName"
                  required
                  placeholder="ej. Juan Pérez"
                  value={formData.applicantName}
                  onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Departamento *</Label>
                <Input
                  id="department"
                  required
                  placeholder="ej. Tecnología"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="costCenter">Centro de Costos *</Label>
                <Input
                  id="costCenter"
                  required
                  placeholder="ej. CC-001"
                  value={formData.costCenter}
                  onChange={(e) => setFormData({ ...formData, costCenter: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="isNewPosition">Nuevo Puesto *</Label>
                <select
                  id="isNewPosition"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.isNewPosition ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, isNewPosition: e.target.value === 'true' })}
                >
                  <option value="false">No</option>
                  <option value="true">Sí</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Nombre de Puesto *</Label>
                <Input
                  id="title"
                  required
                  placeholder="ej. Desarrollador Full Stack Senior"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numberOfPositions">Número de Plaza *</Label>
                <Input
                  id="numberOfPositions"
                  type="number"
                  required
                  min="1"
                  value={formData.numberOfPositions}
                  onChange={(e) => setFormData({ ...formData, numberOfPositions: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="positionScale">Escala de Puesto *</Label>
              <select
                id="positionScale"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.positionScale}
                onChange={(e) => setFormData({ ...formData, positionScale: e.target.value })}
              >
                <option value="">Seleccione...</option>
                <option value="escala-uno-gerentes">Escala Uno - Gerentes</option>
                <option value="escala-dos-jefes-coordinadores">Escala Dos - Jefes y Coordinadores</option>
                <option value="escala-tres-especialistas">Escala Tres - Especialistas</option>
                <option value="escala-cuatro-oficiales-auxiliares">Escala Cuatro - Oficiales y Auxiliares</option>
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Empresa</Label>
                <select
                  id="company"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                >
                  <option value="">Seleccione...</option>
                  <option value="Corporativo">Corporativo</option>
                  <option value="Mansiago">Mansiago</option>
                  <option value="S&M">S&M</option>
                  <option value="Blessing autopartes">Blessing autopartes</option>
                  <option value="Blessing carrocería">Blessing carrocería</option>
                  <option value="Didasa">Didasa</option>
                  <option value="Japan HN">Japan HN</option>
                  <option value="Inversiones Marlon">Inversiones Marlon</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractType">Tipo de Contrato</Label>
                <select
                  id="contractType"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.contractType}
                  onChange={(e) => setFormData({ ...formData, contractType: e.target.value })}
                >
                  <option value="">Seleccione...</option>
                  <option value="Tiempo completo">Tiempo completo</option>
                  <option value="Medio tiempo">Medio tiempo</option>
                  <option value="Contrato por horas">Contrato por horas</option>
                  <option value="Contratos">Contratos</option>
                  <option value="Práctica Profesional">Práctica Profesional</option>
                  <option value="Consultoría">Consultoría</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                placeholder="ej. Ciudad de México (Híbrido)"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mainFunctions">Describa Brevemente las Principales Funciones *</Label>
              <Textarea
                id="mainFunctions"
                required
                rows={6}
                placeholder="Describe las principales responsabilidades y funciones del puesto..."
                value={formData.mainFunctions}
                onChange={(e) => setFormData({ ...formData, mainFunctions: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Nota Informativa */}
        <Card className="border-2 border-cap-gray bg-cap-gray-dark/80">
          <CardContent className="p-4">
            <p className="text-sm text-cap-gray-lightest font-semibold">
              ℹ️ Esta es una solicitud básica. Recursos Humanos revisará esta solicitud y completará la información adicional (criterios de evaluación, IA, etc.) en la sección de Vacantes.
            </p>
          </CardContent>
        </Card>

        {/* Botones de Acción */}
        <div className="flex justify-end gap-3">
          <Link href="/dashboard">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Enviar Solicitud
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
