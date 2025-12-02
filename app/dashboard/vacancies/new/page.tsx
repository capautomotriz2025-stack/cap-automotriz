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
import { ArrowLeft, Sparkles, Loader2, Plus, X, Bot } from 'lucide-react';
import Link from 'next/link';

export default function NewVacancyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    optimizedDescription: '',
    department: '',
    location: '',
    salaryMin: '',
    salaryMax: '',
    currency: 'MXN',
    requiredSkills: [] as string[],
    desiredSkills: [] as string[],
    experienceYears: '',
    educationLevel: '',
    employmentType: 'full-time',
    status: 'draft',
    aiAgentId: ''
  });
  
  const [newSkill, setNewSkill] = useState('');
  const [newDesiredSkill, setNewDesiredSkill] = useState('');

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

  const handleOptimize = async () => {
    if (!formData.title || !formData.description) {
      alert('Por favor completa el título y la descripción primero');
      return;
    }

    setOptimizing(true);
    try {
      const response = await axios.post('/api/ai/optimize-description', {
        title: formData.title,
        description: formData.description
      });

      if (response.data.success) {
        setFormData({
          ...formData,
          optimizedDescription: response.data.data.optimizedDescription
        });
      }
    } catch (error) {
      console.error('Error optimizando:', error);
      alert('Error al optimizar la descripción');
    } finally {
      setOptimizing(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setFormData({
        ...formData,
        requiredSkills: [...formData.requiredSkills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setFormData({
      ...formData,
      requiredSkills: formData.requiredSkills.filter((_, i) => i !== index)
    });
  };

  const addDesiredSkill = () => {
    if (newDesiredSkill.trim()) {
      setFormData({
        ...formData,
        desiredSkills: [...formData.desiredSkills, newDesiredSkill.trim()]
      });
      setNewDesiredSkill('');
    }
  };

  const removeDesiredSkill = (index: number) => {
    setFormData({
      ...formData,
      desiredSkills: formData.desiredSkills.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e: React.FormEvent, publish: boolean = false) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSend = {
        title: formData.title,
        description: formData.description,
        optimizedDescription: formData.optimizedDescription,
        department: formData.department,
        location: formData.location,
        salary: {
          min: parseFloat(formData.salaryMin),
          max: parseFloat(formData.salaryMax),
          currency: formData.currency
        },
        requiredSkills: formData.requiredSkills,
        desiredSkills: formData.desiredSkills,
        experienceYears: parseInt(formData.experienceYears) || 0,
        educationLevel: formData.educationLevel,
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
            Crea una nueva posición y publícala cuando esté lista
          </p>
        </div>
      </div>

      <form className="space-y-6">
        {/* Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
            <CardDescription>Detalles principales de la vacante</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título del Puesto *</Label>
                <Input
                  id="title"
                  required
                  placeholder="ej. Desarrollador Full Stack Senior"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          </CardContent>
        </Card>

        {/* Descripción */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Descripción del Puesto</CardTitle>
                <CardDescription>
                  Describe las responsabilidades y requisitos
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleOptimize}
                disabled={optimizing}
              >
                {optimizing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Optimizando...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Optimizar con IA
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Descripción Original *</Label>
              <Textarea
                id="description"
                required
                rows={6}
                placeholder="Describe el puesto, responsabilidades principales, requisitos..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {formData.optimizedDescription && (
              <div className="space-y-2">
                <Label htmlFor="optimizedDescription">
                  Descripción Optimizada por IA ✨
                </Label>
                <Textarea
                  id="optimizedDescription"
                  rows={6}
                  className="bg-green-50 border-green-200"
                  value={formData.optimizedDescription}
                  onChange={(e) => setFormData({ ...formData, optimizedDescription: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Esta versión se mostrará a los candidatos si está disponible
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Salario */}
        <Card>
          <CardHeader>
            <CardTitle>Compensación</CardTitle>
            <CardDescription>Rango salarial ofrecido</CardDescription>
          </CardHeader>
          <CardContent>
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

        {/* Agente de IA */}
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
              <p className="text-xs text-muted-foreground mt-2">
                El agente define cómo se ponderan experiencia, skills, educación y soft skills. 
                <Link href="/dashboard/ai-agents" className="text-purple-600 hover:underline ml-1">
                  Ver agentes disponibles →
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Habilidades */}
        <Card>
          <CardHeader>
            <CardTitle>Habilidades y Experiencia</CardTitle>
            <CardDescription>Requisitos técnicos y experiencia necesaria</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Habilidades Requeridas */}
            <div className="space-y-2">
              <Label>Habilidades Requeridas</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="ej. React, Node.js, TypeScript..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <Button type="button" onClick={addSkill} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.requiredSkills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="ml-2 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Habilidades Deseables */}
            <div className="space-y-2">
              <Label>Habilidades Deseables (Opcionales)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="ej. Docker, AWS, GraphQL..."
                  value={newDesiredSkill}
                  onChange={(e) => setNewDesiredSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDesiredSkill())}
                />
                <Button type="button" onClick={addDesiredSkill} size="icon" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.desiredSkills.map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeDesiredSkill(index)}
                      className="ml-2 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experienceYears">Años de Experiencia</Label>
                <Input
                  id="experienceYears"
                  type="number"
                  min="0"
                  placeholder="3"
                  value={formData.experienceYears}
                  onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="educationLevel">Nivel Educativo</Label>
                <Input
                  id="educationLevel"
                  placeholder="ej. Licenciatura en Ingeniería"
                  value={formData.educationLevel}
                  onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                />
              </div>
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
            type="submit"
            onClick={(e) => handleSubmit(e, true)}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publicando...
              </>
            ) : (
              'Publicar Vacante'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

