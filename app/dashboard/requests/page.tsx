'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Plus, Upload } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function RequestsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  
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
    educationLevel: '',
    requiredProfessions: ['', '', ''] as string[],
    preferredProfession: '',
    experienceYearsMin: '',
    experienceYearsMax: '',
    evaluationAreas: [
      { area: '', percentage: '' },
      { area: '', percentage: '' },
      { area: '', percentage: '' },
      { area: '', percentage: '' },
      { area: '', percentage: '' }
    ],
    jobDescriptorFile: null as File | null,
    jobDescriptorFileUrl: '',
  });

  const updateEvaluationArea = (index: number, field: 'area' | 'percentage', value: string) => {
    const newAreas = [...formData.evaluationAreas];
    newAreas[index] = { ...newAreas[index], [field]: value };
    setFormData({ ...formData, evaluationAreas: newAreas });
  };

  const handleFileUpload = async (file: File): Promise<string | null> => {
    setUploadingFile(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);
      formDataToSend.append('type', 'job-descriptor');
      
      const response = await axios.post('/api/upload', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setFormData({ ...formData, jobDescriptorFileUrl: response.data.url });
        return response.data.url;
      }
      return null;
    } catch (error) {
      console.error('Error subiendo archivo:', error);
      alert('Error al subir el archivo');
      return null;
    } finally {
      setUploadingFile(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, jobDescriptorFile: file });
      await handleFileUpload(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar que los porcentajes de áreas sumen 100% si hay áreas definidas
      const filledAreas = formData.evaluationAreas.filter(area => area.area.trim() !== '');
      if (filledAreas.length > 0) {
        const totalPercentage = filledAreas.reduce((sum, area) => sum + (parseFloat(area.percentage) || 0), 0);
        if (totalPercentage !== 100) {
          alert('Los porcentajes de las habilidades técnicas deben sumar exactamente 100%');
          setLoading(false);
          return;
        }
      }

      // Subir archivo si existe
      let jobDescriptorUrl = formData.jobDescriptorFileUrl;
      if (formData.jobDescriptorFile && !jobDescriptorUrl) {
        const uploadedUrl = await handleFileUpload(formData.jobDescriptorFile);
        if (uploadedUrl) {
          jobDescriptorUrl = uploadedUrl;
        }
      }

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
        // Criterios de evaluación
        educationLevel: formData.educationLevel || undefined,
        requiredProfessions: formData.requiredProfessions.filter(p => p.trim() !== ''),
        preferredProfession: formData.preferredProfession || undefined,
        experienceYearsMin: formData.experienceYearsMin ? parseInt(formData.experienceYearsMin) || 0 : 0,
        experienceYearsMax: formData.experienceYearsMax ? parseInt(formData.experienceYearsMax) || 0 : 0,
        requiredProfession: formData.requiredProfessions[0] || '',
        experienceYears: formData.experienceYearsMin ? parseInt(formData.experienceYearsMin) || 0 : 0,
        evaluationAreas: formData.evaluationAreas
          .filter(area => area.area.trim() !== '')
          .map(area => ({
            area: area.area.trim(),
            percentage: parseFloat(area.percentage) || 0
          })),
        jobDescriptorFile: jobDescriptorUrl || undefined,
        salary: {
          min: 0,
          max: 0,
          currency: 'MXN'
        },
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
                <option value="1">Auxiliar (Escala 1)</option>
                <option value="2">Oficial Junior (Escala 2)</option>
                <option value="3">Oficial Senior (Escala 3)</option>
                <option value="4">Analista (Escala 4)</option>
                <option value="4">Especialista (Escala 4)</option>
                <option value="5">Coordinación (Escala 5)</option>
                <option value="6">Jefatura (Escala 6)</option>
                <option value="7">Subgerencia (Escala 7)</option>
                <option value="8">Gerencia (Escala 8)</option>
                <option value="9">Director (Escala 9)</option>
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

            {/* Criterios de Evaluación */}
            <div className="space-y-4 pt-4 border-t border-cap-gray">
              <Label className="text-base font-semibold">Criterios de Evaluación</Label>

              <div className="space-y-2">
                <Label htmlFor="educationLevel">Nivel educativo requerido</Label>
                <select
                  id="educationLevel"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.educationLevel}
                  onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                >
                  <option value="">Seleccione...</option>
                  <option value="Secundaria">Secundaria</option>
                  <option value="Universitaria">Universitaria</option>
                  <option value="Estudiante universitario">Estudiante universitario</option>
                  <option value="Técnico">Técnico</option>
                  <option value="Master (Con Maestría)">Master (Con Maestría)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Profesiones requeridas</Label>
                <div className="grid md:grid-cols-3 gap-4">
                  {formData.requiredProfessions.map((profession, index) => (
                    <Input
                      key={index}
                      placeholder={`Profesión ${index + 1}`}
                      value={profession}
                      onChange={(e) => {
                        const newProfessions = [...formData.requiredProfessions];
                        newProfessions[index] = e.target.value;
                        setFormData({ ...formData, requiredProfessions: newProfessions });
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredProfession">Profesión preferible</Label>
                <Input
                  id="preferredProfession"
                  placeholder="ej. Ingeniería en Sistemas"
                  value={formData.preferredProfession}
                  onChange={(e) => setFormData({ ...formData, preferredProfession: e.target.value })}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experienceYearsMin">Años de experiencia mínimo</Label>
                  <Input
                    id="experienceYearsMin"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.experienceYearsMin}
                    onChange={(e) => setFormData({ ...formData, experienceYearsMin: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experienceYearsMax">Años de experiencia máximo</Label>
                  <Input
                    id="experienceYearsMax"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.experienceYearsMax}
                    onChange={(e) => setFormData({ ...formData, experienceYearsMax: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-sm">Habilidades técnicas que desea evaluar</Label>
                {formData.evaluationAreas.map((area, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <div className="flex-1">
                      <Input
                        placeholder={`Habilidad técnica ${index + 1}`}
                        value={area.area}
                        onChange={(e) => updateEvaluationArea(index, 'area', e.target.value)}
                      />
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="%"
                        value={area.percentage}
                        onChange={(e) => updateEvaluationArea(index, 'percentage', e.target.value)}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  Los porcentajes deben sumar 100% en total
                </p>
              </div>
            </div>

            {/* Descriptor de Puesto */}
            <div className="space-y-2 pt-4 border-t border-cap-gray">
              <Label htmlFor="jobDescriptor">Descriptor de Puesto</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="jobDescriptor"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                {formData.jobDescriptorFile && (
                  <Badge variant="secondary">
                    {formData.jobDescriptorFile.name}
                  </Badge>
                )}
                {uploadingFile && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Solo archivos PDF (máximo 10 MB)
              </p>
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
