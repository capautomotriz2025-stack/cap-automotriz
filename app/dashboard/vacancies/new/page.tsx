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
import { buildAgentPayloadFromVacancy } from '@/lib/vacancy-to-agent';

export default function NewVacancyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [showCreateAgentModal, setShowCreateAgentModal] = useState(false);
  const [creatingAgent, setCreatingAgent] = useState(false);
  
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
    location: '', // Ubicación
    contractType: '', // Tipo de contrato
    // Criterios de evaluación
    educationLevel: '',
    requiredProfessions: ['', '', ''], // 3 campos
    preferredProfession: '',
    experienceYearsMin: '',
    experienceYearsMax: '',
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
    salaryMin: '',
    salaryMax: '',
    currency: 'MXN',
    applicationDeadline: '', // Fecha límite para recibir CVs
    timecv: '', // Tiempo de recepción de CVs
    status: 'draft',
    aiAgentId: '',
    thresholds: { ideal: 80, potential: 65, review: 50 }
  });

  useEffect(() => {
    fetchAgents();
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const response = await axios.get('/api/vacancies?status=pending');
      if (response.data.success) {
        setPendingRequests(response.data.data);
      }
    } catch (error) {
      console.error('Error cargando solicitudes pendientes:', error);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const handleRequestSelect = async (requestId: string) => {
    if (!requestId) {
      // Limpiar formulario si se selecciona "Nueva vacante"
      setFormData({
        applicantName: '',
        department: '',
        costCenter: '',
        isNewPosition: false,
        title: '',
        numberOfPositions: '1',
        positionScale: '',
        mainFunctions: '',
        company: '',
        location: '',
        contractType: '',
        educationLevel: '',
        requiredProfessions: ['', '', ''],
        preferredProfession: '',
        experienceYearsMin: '',
        experienceYearsMax: '',
        evaluationLevel: '',
        evaluationAreas: [
          { area: '', percentage: '' },
          { area: '', percentage: '' },
          { area: '', percentage: '' },
          { area: '', percentage: '' },
          { area: '', percentage: '' }
        ],
        jobDescriptorFile: null,
        jobDescriptorFileUrl: '',
        salaryMin: '',
        salaryMax: '',
        currency: 'MXN',
        applicationDeadline: '',
        timecv: '',
        status: 'draft',
        aiAgentId: '',
        thresholds: { ideal: 80, potential: 65, review: 50 }
      });
      setSelectedRequestId('');
      return;
    }

    try {
      const response = await axios.get(`/api/vacancies/${requestId}`);
      if (response.data.success) {
        const request = response.data.data;
        setSelectedRequestId(requestId);
        
        // Pre-llenar formulario con datos de la solicitud
        setFormData({
          applicantName: request.applicantName || '',
          department: request.department || '',
          costCenter: request.costCenter || '',
          isNewPosition: request.isNewPosition || false,
          title: request.title || '',
          numberOfPositions: (request.numberOfPositions || 1).toString(),
          positionScale: request.positionScale || '',
          mainFunctions: request.mainFunctions || '',
          company: request.company || '',
          location: request.location && request.location !== 'Por definir' ? request.location : '',
          contractType: request.contractType || '',
          educationLevel: request.educationLevel || '',
          requiredProfessions: request.requiredProfessions && request.requiredProfessions.length > 0
            ? request.requiredProfessions.concat(['', '', '']).slice(0, 3)
            : ['', '', ''],
          preferredProfession: request.preferredProfession || '',
          experienceYearsMin: (request.experienceYearsMin || 0).toString(),
          experienceYearsMax: (request.experienceYearsMax || 0).toString(),
          evaluationLevel: request.evaluationLevel || '',
          evaluationAreas: request.evaluationAreas && request.evaluationAreas.length > 0
            ? request.evaluationAreas.map((ea: any) => ({
                area: ea.area || '',
                percentage: (ea.percentage || 0).toString()
              })).concat([
                { area: '', percentage: '' },
                { area: '', percentage: '' },
                { area: '', percentage: '' },
                { area: '', percentage: '' },
                { area: '', percentage: '' }
              ]).slice(0, 5)
            : [
                { area: '', percentage: '' },
                { area: '', percentage: '' },
                { area: '', percentage: '' },
                { area: '', percentage: '' },
                { area: '', percentage: '' }
              ],
          jobDescriptorFile: null,
          jobDescriptorFileUrl: request.jobDescriptorFile || '',
          salaryMin: request.salary?.min?.toString() || '',
          salaryMax: request.salary?.max?.toString() || '',
          currency: request.salary?.currency || 'MXN',
          applicationDeadline: request.applicationDeadline 
            ? new Date(request.applicationDeadline).toISOString().slice(0, 16)
            : '',
          timecv: request.timecv || '',
          status: request.status || 'draft',
          aiAgentId: request.aiAgentId || '',
          thresholds: request.thresholds || { ideal: 80, potential: 65, review: 50 }
        });
      }
    } catch (error) {
      console.error('Error cargando solicitud:', error);
      alert('Error al cargar la solicitud seleccionada');
    }
  };

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

  const handleCreateAgentFromVacancy = async () => {
    if (!formData.title?.trim()) {
      alert('Completa al menos el nombre del puesto (título) para crear el agente.');
      return;
    }
    setCreatingAgent(true);
    try {
      const payload = buildAgentPayloadFromVacancy(formData);
      const response = await axios.post('/api/ai-agents', { ...payload, isTemplate: false });
      if (response.data?.success && response.data?.data?._id) {
        setFormData((prev) => ({ ...prev, aiAgentId: response.data.data._id }));
        await fetchAgents();
        setShowCreateAgentModal(false);
      } else {
        alert(response.data?.error || 'Error al crear el agente');
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al crear el agente');
    } finally {
      setCreatingAgent(false);
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
        mainFunctions: formData.mainFunctions,
        company: formData.company,
        location: formData.location,
        contractType: formData.contractType,
        // Criterios de evaluación
        educationLevel: formData.educationLevel,
        requiredProfessions: formData.requiredProfessions.filter(p => p.trim() !== ''),
        preferredProfession: formData.preferredProfession || undefined,
        experienceYearsMin: parseInt(formData.experienceYearsMin) || 0,
        experienceYearsMax: parseInt(formData.experienceYearsMax) || 0,
        evaluationLevel: formData.evaluationLevel,
        evaluationAreas: formData.evaluationAreas
          .filter(area => area.area.trim() !== '')
          .map(area => ({
            area: area.area.trim(),
            percentage: parseFloat(area.percentage) || 0
          })),
        jobDescriptorFile: jobDescriptorUrl || undefined,
        salary: {
          min: parseFloat(formData.salaryMin),
          max: parseFloat(formData.salaryMax),
          currency: formData.currency
        },
        applicationDeadline: formData.applicationDeadline ? new Date(formData.applicationDeadline) : undefined,
        timecv: formData.timecv || undefined,
        thresholds: formData.thresholds ? { ideal: formData.thresholds.ideal, potential: formData.thresholds.potential, review: formData.thresholds.review } : undefined,
        // Mantener compatibilidad con campos legacy
        requiredProfession: formData.requiredProfessions[0] || '',
        experienceYears: parseInt(formData.experienceYearsMin) || 0,
        employmentType: 'full-time' as const, // Mantener por compatibilidad
        status: publish ? 'published' : 'draft',
        aiAgentId: formData.aiAgentId || undefined
      };

      // Si hay una solicitud seleccionada, actualizarla; si no, crear una nueva
      let response;
      if (selectedRequestId) {
        response = await axios.put(`/api/vacancies/${selectedRequestId}`, dataToSend);
      } else {
        response = await axios.post('/api/vacancies', dataToSend);
      }

      if (response.data.success) {
        if (selectedRequestId) {
          alert(publish ? '¡Solicitud completada y publicada exitosamente!' : '¡Solicitud completada y guardada como borrador!');
        } else {
          alert(publish ? '¡Vacante publicada exitosamente!' : '¡Vacante guardada como borrador!');
        }
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
        {/* Selector de Solicitud Precargada */}
        {pendingRequests.length > 0 && (
          <Card className="border-2 border-blue-500/30 bg-blue-500/10">
            <CardHeader>
              <CardTitle className="text-xl font-black text-white">Seleccionar Solicitud Precargada</CardTitle>
              <CardDescription className="text-cap-gray-lightest font-semibold">
                Elige una solicitud pendiente para completar o crea una nueva vacante desde cero
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="selectRequest">Solicitud Pendiente</Label>
                <select
                  id="selectRequest"
                  className="flex h-12 w-full rounded-md border-2 border-input bg-background px-3 py-2 text-sm font-semibold"
                  value={selectedRequestId}
                  onChange={(e) => handleRequestSelect(e.target.value)}
                  disabled={isLoadingRequests}
                >
                  <option value="">-- Crear nueva vacante desde cero --</option>
                  {pendingRequests.map((request) => (
                    <option key={request._id} value={request._id}>
                      {request.title} - {request.applicantName} ({request.department}) - {new Date(request.createdAt).toLocaleDateString('es-MX')}
                    </option>
                  ))}
                </select>
                {selectedRequestId && (
                  <div className="mt-3 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                    <p className="text-sm text-white font-bold">
                      ✓ Solicitud seleccionada. Los campos se han pre-llenado. Completa la información faltante y guarda.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

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
                  <option value="1">Auxiliar (Escala 1)</option>
                  <option value="2">Oficial Junior (Escala 2)</option>
                  <option value="3">Oficial Senior (Escala 3)</option>
                  <option value="4">Analista (Escala 4)</option>
                  <option value="4e">Especialista (Escala 4)</option>
                  <option value="5">Coordinación (Escala 5)</option>
                  <option value="6">Jefatura (Escala 6)</option>
                  <option value="7">Subgerencia (Escala 7)</option>
                  <option value="8">Gerencia (Escala 8)</option>
                  <option value="9">Director (Escala 9)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Empresa *</Label>
                <select
                  id="company"
                  required
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
            </div>

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
                <Label htmlFor="contractType">Tipo de Contrato *</Label>
                <select
                  id="contractType"
                  required
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
                  <option value="consultoría">consultoría</option>
                </select>
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
              <Label htmlFor="educationLevel">Nivel Educativo Requerido *</Label>
              <select
                id="educationLevel"
                required
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
              <Label>Profesiones Requeridas *</Label>
              <div className="grid md:grid-cols-3 gap-4">
                {formData.requiredProfessions.map((profession, index) => (
                  <Input
                    key={index}
                    required
                    placeholder={`Profesión ${index + 1} *`}
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
              <Label htmlFor="preferredProfession">Profesión Preferible</Label>
              <Input
                id="preferredProfession"
                placeholder="ej. Ingeniería en Sistemas"
                value={formData.preferredProfession}
                onChange={(e) => setFormData({ ...formData, preferredProfession: e.target.value })}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experienceYearsMin">Años de Experiencia Mínimos *</Label>
                <Input
                  id="experienceYearsMin"
                  type="number"
                  required
                  min="0"
                  placeholder="3"
                  value={formData.experienceYearsMin}
                  onChange={(e) => setFormData({ ...formData, experienceYearsMin: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experienceYearsMax">Años de Experiencia Máximo *</Label>
                <Input
                  id="experienceYearsMax"
                  type="number"
                  required
                  min="0"
                  placeholder="5"
                  value={formData.experienceYearsMax}
                  onChange={(e) => setFormData({ ...formData, experienceYearsMax: e.target.value })}
                />
              </div>
            </div>

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
              <Label>Habilidades técnicas que desea evaluar</Label>
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

        {/* Salario */}
        <Card>
          <CardHeader>
            <CardTitle>Información de Salario</CardTitle>
            <CardDescription>Rango salarial para el puesto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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

        {/* Fecha Límite de Recepción de CVs */}
        <Card>
          <CardHeader>
            <CardTitle>Fecha Límite de Recepción de CVs</CardTitle>
            <CardDescription>Establece hasta cuándo se recibirán aplicaciones para esta vacante</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="applicationDeadline">Fecha y Hora Límite</Label>
              <Input
                id="applicationDeadline"
                type="datetime-local"
                value={formData.applicationDeadline}
                onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Cuando llegue esta fecha, se generará una notificación automática
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timecv">Tiempo de Recepción de CVs</Label>
              <select
                id="timecv"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.timecv}
                onChange={(e) => setFormData({ ...formData, timecv: e.target.value })}
              >
                <option value="">Seleccione un tiempo...</option>
                <option value="1 semana">1 semana</option>
                <option value="1 mes">1 mes</option>
                <option value="2 meses">2 meses</option>
                <option value="3 meses">3 meses</option>
                <option value="6 meses">6 meses</option>
                <option value="1 año">1 año</option>
              </select>
              <p className="text-xs text-muted-foreground">
                El tiempo se calculará desde la fecha de publicación. Puedes actualizarlo después desde la tabla de vacantes.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Umbrales de Clasificación */}
        <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50/50 to-white">
          <CardHeader>
            <CardTitle>Umbrales de Clasificación</CardTitle>
            <CardDescription>Define los puntajes para cada clasificación del candidato</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="thresholdIdeal" className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  Ideal (≥)
                </Label>
                <Input
                  id="thresholdIdeal"
                  type="number"
                  min={0}
                  max={100}
                  value={formData.thresholds?.ideal ?? 80}
                  onChange={(e) => setFormData({
                    ...formData,
                    thresholds: { ...(formData.thresholds || { ideal: 80, potential: 65, review: 50 }), ideal: parseInt(e.target.value) || 0 }
                  })}
                />
                <p className="text-xs text-muted-foreground">Entrevistar inmediatamente</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="thresholdPotential" className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  Potencial (≥)
                </Label>
                <Input
                  id="thresholdPotential"
                  type="number"
                  min={0}
                  max={100}
                  value={formData.thresholds?.potential ?? 65}
                  onChange={(e) => setFormData({
                    ...formData,
                    thresholds: { ...(formData.thresholds || { ideal: 80, potential: 65, review: 50 }), potential: parseInt(e.target.value) || 0 }
                  })}
                />
                <p className="text-xs text-muted-foreground">Considerar para segunda ronda</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="thresholdReview" className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  Revisar (≥)
                </Label>
                <Input
                  id="thresholdReview"
                  type="number"
                  min={0}
                  max={100}
                  value={formData.thresholds?.review ?? 50}
                  onChange={(e) => setFormData({
                    ...formData,
                    thresholds: { ...(formData.thresholds || { ideal: 80, potential: 65, review: 50 }), review: parseInt(e.target.value) || 0 }
                  })}
                />
                <p className="text-xs text-muted-foreground">Revisar manualmente</p>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="aiAgent">Agente de IA</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-purple-600 border-purple-300 hover:bg-purple-50"
                  onClick={() => setShowCreateAgentModal(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Crear agente desde esta vacante
                </Button>
              </div>
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

      {/* Modal Crear agente desde esta vacante */}
      {showCreateAgentModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-cap-gray-dark border-2 border-cap-gray">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Crear agente desde esta vacante</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowCreateAgentModal(false)}>
                  <X className="h-4 w-4 text-white" />
                </Button>
              </div>
              <CardDescription className="text-cap-gray-lightest">
                Se creará un agente con el nombre del puesto, criterios y umbrales actuales. Se asignará automáticamente a esta vacante.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowCreateAgentModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateAgentFromVacancy} disabled={creatingAgent}>
                {creatingAgent ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
                {creatingAgent ? 'Creando...' : 'Crear agente'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
