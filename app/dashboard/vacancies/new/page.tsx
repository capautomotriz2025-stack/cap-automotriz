'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Sparkles, Loader2, Plus, X, Bot, Upload } from 'lucide-react';
import Link from 'next/link';

export default function NewVacancyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  
  const [formData, setFormData] = useState({
    applicantName: '',
    department: '',
    costCenter: '',
    isNewPosition: false,
    title: '', // Nombre de Puesto
    numberOfPositions: '1',
    positionScale: '',
    requiredProfession: '',
    requiredSpecialties: '',
    experienceYears: '',
    mainFunctions: '', // Describa Brevemente las Principales Funciones
    evaluationLevel: '',
    evaluationAreas: [
      { area: '', percentage: '' },
      { area: '', percentage: '' },
      { area: '', percentage: '' },
      { area: '', percentage: '' },
      { area: '', percentage: '' }
    ],
    jobDescriptorFile: null as File | null,
    jobDescriptorFileUrl: '',
    location: '',
    salaryMin: '',
    salaryMax: '',
    currency: 'MXN',
    employmentType: 'full-time',
    status: 'draft',
    aiAgentId: ''
  });

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await axios.get('/api/ai-agents');
      if (response.data.success) {
        setAgents(response.data.data);
      }
    } catch (error) {
      console.error('Error cargando agentes:', error);
    }
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

  const updateEvaluationArea = (index: number, field: 'area' | 'percentage', value: string) => {
    const newAreas = [...formData.evaluationAreas];
    newAreas[index] = { ...newAreas[index], [field]: value };
    setFormData({ ...formData, evaluationAreas: newAreas });
  };

  const handleSubmit = async (e: React.FormEvent, publish: boolean = false) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar que los porcentajes de áreas sumen 100%
      const totalPercentage = formData.evaluationAreas
        .filter(area => area.area.trim() !== '')
        .reduce((sum, area) => sum + (parseFloat(area.percentage) || 0), 0);
      
      if (totalPercentage !== 100 && formData.evaluationAreas.some(a => a.area.trim() !== '')) {
        alert('Los porcentajes de las áreas de evaluación deben sumar exactamente 100%');
        setLoading(false);
        return;
      }

      // Subir archivo si existe
      let jobDescriptorUrl = formData.jobDescriptorFileUrl;
      if (formData.jobDescriptorFile && !jobDescriptorUrl) {
        const uploadedUrl = await handleFileUpload(formData.jobDescriptorFile);
        if (uploadedUrl) {
          jobDescriptorUrl = uploadedUrl;
        }
      }

      const dataToSend = {
        applicantName: formData.applicantName,
        department: formData.department,
        costCenter: formData.costCenter,
        isNewPosition: formData.isNewPosition,
        title: formData.title,
        numberOfPositions: parseInt(formData.numberOfPositions) || 1,
        positionScale: formData.positionScale,
        requiredProfession: formData.requiredProfession,
        requiredSpecialties: formData.requiredSpecialties || undefined,
        experienceYears: parseInt(formData.experienceYears) || 0,
        mainFunctions: formData.mainFunctions,
        evaluationLevel: formData.evaluationLevel,
        evaluationAreas: formData.evaluationAreas
          .filter(area => area.area.trim() !== '')
          .map(area => ({
            area: area.area.trim(),
            percentage: parseFloat(area.percentage) || 0
          })),
        jobDescriptorFile: jobDescriptorUrl || undefined,
        location: formData.location,
        salary: {
          min: parseFloat(formData.salaryMin),
          max: parseFloat(formData.salaryMax),
          currency: formData.currency
        },
        employmentType: formData.employmentType,
        status: publish ? 'published' : 'draft',
        aiAgentId: formData.aiAgentId || undefined
      };

      const response = await axios.post('/api/vacancies', dataToSend);

      if (response.data.success) {
        alert(publish ? '¡Vacante publicada exitosamente!' : '¡Vacante guardada como borrador!');
        router.push('/dashboard/vacancies');
      }
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.response?.data?.error || 'Error al guardar la vacante');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/vacancies">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-black text-white">Nueva Vacante</h1>
          <p className="text-cap-gray-lightest mt-1 font-semibold">
            Sistema de Solicitud de Recursos Humanos
          </p>
        </div>
      </div>

      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        {/* Información de Solicitud */}
        <Card>
          <CardHeader>
            <CardTitle>Información de Solicitud</CardTitle>
            <CardDescription>Datos del solicitante y del puesto</CardDescription>
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

            <div className="grid md:grid-cols-2 gap-4">
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

              <div className="space-y-2">
                <Label htmlFor="requiredProfession">Profesión Requerida *</Label>
                <Input
                  id="requiredProfession"
                  required
                  placeholder="ej. Ingeniería en Sistemas"
                  value={formData.requiredProfession}
                  onChange={(e) => setFormData({ ...formData, requiredProfession: e.target.value })}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="requiredSpecialties">Especialidades Requeridas</Label>
                <Input
                  id="requiredSpecialties"
                  placeholder="ej. React, Node.js, TypeScript"
                  value={formData.requiredSpecialties}
                  onChange={(e) => setFormData({ ...formData, requiredSpecialties: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experienceYears">Años de Experiencia *</Label>
                <Input
                  id="experienceYears"
                  type="number"
                  required
                  min="0"
                  placeholder="3"
                  value={formData.experienceYears}
                  onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                />
              </div>
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

        {/* Criterios de Evaluación */}
        <Card>
          <CardHeader>
            <CardTitle>Criterios de Evaluación</CardTitle>
            <CardDescription>Configure cómo se evaluará a los candidatos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="evaluationLevel">Nivel de Evaluación *</Label>
              <select
                id="evaluationLevel"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.evaluationLevel}
                onChange={(e) => setFormData({ ...formData, evaluationLevel: e.target.value })}
              >
                <option value="">Seleccione...</option>
                <option value="basico">Básico</option>
                <option value="intermedio">Intermedio</option>
                <option value="avanzado">Avanzado</option>
                <option value="experto">Experto</option>
              </select>
            </div>

            <div className="space-y-4">
              <Label>Describa las Áreas que Desea Evaluar al Recurso</Label>
              {formData.evaluationAreas.map((area, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <div className="flex-1">
                    <Input
                      placeholder={`Área ${index + 1}`}
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
                  <span className="text-sm text-muted-foreground">% {index + 1}</span>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                Los porcentajes deben sumar 100% en total
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Descriptor de Puesto */}
        <Card>
          <CardHeader>
            <CardTitle>Descriptor de Puesto</CardTitle>
            <CardDescription>Adjunte el documento descriptor del puesto</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="jobDescriptor">Adjuntar Archivo</Label>
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

        {/* Información Adicional */}
        <Card>
          <CardHeader>
            <CardTitle>Información Adicional</CardTitle>
            <CardDescription>Ubicación, salario y tipo de empleo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Ubicación *</Label>
                <Input
                  id="location"
                  required
                  placeholder="ej. Ciudad de México (Híbrido)"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employmentType">Tipo de Empleo *</Label>
                <select
                  id="employmentType"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.employmentType}
                  onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                >
                  <option value="full-time">Tiempo Completo</option>
                  <option value="part-time">Medio Tiempo</option>
                  <option value="contract">Contrato</option>
                  <option value="internship">Prácticas</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salaryMin">Salario Mínimo *</Label>
                <Input
                  id="salaryMin"
                  type="number"
                  required
                  placeholder="25000"
                  value={formData.salaryMin}
                  onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salaryMax">Salario Máximo *</Label>
                <Input
                  id="salaryMax"
                  type="number"
                  required
                  placeholder="35000"
                  value={formData.salaryMax}
                  onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Moneda</Label>
                <select
                  id="currency"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                >
                  <option value="MXN">MXN (Pesos)</option>
                  <option value="USD">USD (Dólares)</option>
                  <option value="EUR">EUR (Euros)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agente de IA - MANTENER */}
        <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50/50 to-white">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-purple-600" />
              <CardTitle>Agente de Evaluación IA</CardTitle>
            </div>
            <CardDescription>
              Selecciona cómo la IA evaluará a los candidatos para este puesto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="aiAgent">Agente de IA</Label>
              <select
                id="aiAgent"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.aiAgentId}
                onChange={(e) => setFormData({ ...formData, aiAgentId: e.target.value })}
              >
                <option value="">Sin agente específico (evaluación genérica)</option>
                <optgroup label="🌟 Plantillas del Sistema">
                  {agents.filter(a => a.isTemplate).map((agent) => (
                    <option key={agent.name} value={agent._id || agent.name}>
                      {agent.name} - {agent.category}
                    </option>
                  ))}
                </optgroup>
                {agents.filter(a => !a.isTemplate).length > 0 && (
                  <optgroup label="⚙️ Mis Agentes Personalizados">
                    {agents.filter(a => !a.isTemplate).map((agent) => (
                      <option key={agent._id} value={agent._id}>
                        {agent.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              {formData.aiAgentId && (
                <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm text-purple-900 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span className="font-semibold">Evaluación Especializada:</span>
                  </p>
                  <p className="text-sm text-purple-700 mt-1">
                    Los candidatos serán evaluados con criterios específicos para este tipo de puesto
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Botones de Acción */}
        <div className="flex justify-end gap-3">
          <Link href="/dashboard/vacancies">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button
            type="button"
            variant="outline"
            onClick={(e) => handleSubmit(e, false)}
            disabled={loading}
          >
            Guardar Borrador
          </Button>
          <Button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={loading}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publicando...
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
