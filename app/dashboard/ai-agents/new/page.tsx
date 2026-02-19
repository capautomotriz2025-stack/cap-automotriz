'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Bot, Sparkles, Save, Info, Plus, X, Eye, Edit2, Check } from 'lucide-react';
import { generateSystemPrompt } from '@/lib/prompt-generator';

export default function NewAIAgentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'otro',
    description: '',
    criteria: {
      experience: {
        weight: 25,
        minYears: 0,
        importance: 'medium' as 'low' | 'medium' | 'high',
      },
      technicalSkills: {
        weight: 30,
        required: [] as string[],
        desired: [] as string[],
        certifications: [] as string[],
      },
      education: {
        weight: 15,
        minLevel: 'none' as 'none' | 'high-school' | 'bachelor' | 'master' | 'phd',
        required: false,
      },
      softSkills: {
        weight: 15,
        keySkills: [] as string[],
      },
      progression: {
        weight: 15,
      },
    },
    thresholds: {
      ideal: 80,
      potential: 65,
      review: 50,
    },
    active: true,
  });

  const [newRequiredSkill, setNewRequiredSkill] = useState('');
  const [newDesiredSkill, setNewDesiredSkill] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [advancedMode, setAdvancedMode] = useState(false);
  const [manualPrompt, setManualPrompt] = useState('');

  // Generar prompt automáticamente cuando cambien los datos del formulario
  const generatedPrompt = useMemo(() => {
    if (!formData.name.trim()) {
      return '';
    }
    try {
      return generateSystemPrompt({
        name: formData.name,
        category: formData.category,
        description: formData.description,
        criteria: formData.criteria,
        thresholds: formData.thresholds,
      });
    } catch (error) {
      console.error('Error generando prompt:', error);
      return '';
    }
  }, [formData]);

  // Sincronizar manualPrompt con generatedPrompt cuando se desactiva advancedMode
  useEffect(() => {
    if (!advancedMode && generatedPrompt) {
      setManualPrompt(generatedPrompt);
    }
  }, [advancedMode, generatedPrompt]);

  // Usar prompt manual si está en modo avanzado, sino usar el generado
  const finalPrompt = advancedMode ? manualPrompt : generatedPrompt;

  useEffect(() => {
    fetchTemplates();
    // Inicializar manualPrompt con el prompt generado inicial
    if (generatedPrompt) {
      setManualPrompt(generatedPrompt);
    }
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get('/api/ai-agents');
      if (response.data.success) {
        setTemplates(response.data.data.filter((a: any) => a.isTemplate));
      }
    } catch (error) {
      console.error('Error cargando plantillas:', error);
    }
  };

  const loadTemplate = (templateId: string) => {
    const template = templates.find(t => (t._id || t.name) === templateId);
    if (template) {
      const newFormData = {
        name: `${template.name} (Personalizado)`,
        category: template.category,
        description: template.description || '',
        criteria: JSON.parse(JSON.stringify(template.criteria)),
        thresholds: { ...template.thresholds },
        systemPrompt: template.systemPrompt,
        active: true,
      };
      setFormData(newFormData);
      setSelectedTemplate(templateId);
      // Si el template tiene un prompt personalizado, activar modo avanzado
      if (template.systemPrompt && template.systemPrompt !== generateSystemPrompt(newFormData)) {
        setAdvancedMode(true);
        setManualPrompt(template.systemPrompt);
      }
    }
  };

  const handleWeightChange = (category: string, value: number) => {
    const newCriteria = { ...formData.criteria };
    (newCriteria as any)[category].weight = Math.max(0, Math.min(100, value));
    setFormData({ ...formData, criteria: newCriteria });
  };

  const addSkill = (type: 'required' | 'desired' | 'certification') => {
    if (type === 'required' && newRequiredSkill.trim()) {
      const newCriteria = { ...formData.criteria };
      newCriteria.technicalSkills.required.push(newRequiredSkill.trim());
      setFormData({ ...formData, criteria: newCriteria });
      setNewRequiredSkill('');
    } else if (type === 'desired' && newDesiredSkill.trim()) {
      const newCriteria = { ...formData.criteria };
      newCriteria.technicalSkills.desired.push(newDesiredSkill.trim());
      setFormData({ ...formData, criteria: newCriteria });
      setNewDesiredSkill('');
    } else if (type === 'certification' && newCertification.trim()) {
      const newCriteria = { ...formData.criteria };
      newCriteria.technicalSkills.certifications = newCriteria.technicalSkills.certifications || [];
      newCriteria.technicalSkills.certifications.push(newCertification.trim());
      setFormData({ ...formData, criteria: newCriteria });
      setNewCertification('');
    }
  };

  const removeSkill = (type: 'required' | 'desired' | 'certification', index: number) => {
    const newCriteria = { ...formData.criteria };
    if (type === 'required') {
      newCriteria.technicalSkills.required.splice(index, 1);
    } else if (type === 'desired') {
      newCriteria.technicalSkills.desired.splice(index, 1);
    } else if (type === 'certification') {
      newCriteria.technicalSkills.certifications?.splice(index, 1);
    }
    setFormData({ ...formData, criteria: newCriteria });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que los pesos sumen 100% (solo experiencia, educación y habilidades técnicas)
    const calculatedWeight = 
      formData.criteria.experience.weight +
      formData.criteria.technicalSkills.weight +
      formData.criteria.education.weight;
    
    if (calculatedWeight !== 100) {
      alert('La suma de los pesos (Experiencia Laboral + Nivel Educativo + Habilidades Técnicas) debe ser exactamente 100%');
      return;
    }

    if (!formData.name.trim()) {
      alert('El nombre del agente es requerido');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/ai-agents', {
        ...formData,
        systemPrompt: finalPrompt, // Usar el prompt final (generado o manual)
        isTemplate: false,
      });

      if (response.data.success) {
        alert('¡Agente de IA creado exitosamente!');
        router.push('/dashboard/ai-agents');
      }
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.response?.data?.error || 'Error al crear el agente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/ai-agents">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-black text-white">Nuevo Agente de IA</h1>
          <p className="text-cap-gray-lightest mt-1 font-semibold">
            Crea un agente personalizado o parte de una plantilla
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Selección de Plantilla */}
        <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50/50 to-white">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <CardTitle>Comenzar desde Plantilla (Opcional)</CardTitle>
            </div>
            <CardDescription>
              Selecciona una plantilla pre-configurada y personalízala a tu gusto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-3">
              <Button
                type="button"
                variant={selectedTemplate === '' ? 'default' : 'outline'}
                className="h-auto py-4 flex flex-col items-start"
                onClick={() => {
                  setSelectedTemplate('');
                  setAdvancedMode(false);
                  // Reset to default
                  setFormData({
                    ...formData,
                    name: '',
                    category: 'otro',
                    description: '',
                  });
                }}
              >
                <div className="font-bold">Desde Cero</div>
                <div className="text-xs text-muted-foreground">Crea un agente completamente personalizado</div>
              </Button>
              
              {templates.slice(0, 5).map((template) => (
                <Button
                  key={template._id || template.name}
                  type="button"
                  variant={selectedTemplate === (template._id || template.name) ? 'default' : 'outline'}
                  className="h-auto py-4 flex flex-col items-start"
                  onClick={() => loadTemplate(template._id || template.name)}
                >
                  <div className="font-bold">{template.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">{template.category}</div>
                </Button>
              ))}
            </div>
            {selectedTemplate && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-900 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  <span className="font-semibold">Plantilla cargada.</span>
                  Puedes editar cualquier campo a continuación.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
            <CardDescription>Nombre y descripción del agente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Agente *</Label>
                <Input
                  id="name"
                  required
                  placeholder="ej. Desarrollador Backend Python"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <select
                  id="category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="otro">Otro</option>
                  <option value="desarrollo">Desarrollo</option>
                  <option value="gerencia">Gerencia</option>
                  <option value="diseño">Diseño</option>
                  <option value="marketing">Marketing</option>
                  <option value="finanzas">Finanzas</option>
                  <option value="rrhh">Recursos Humanos</option>
                  <option value="operaciones">Operaciones</option>
                  <option value="soporte">Soporte</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                rows={3}
                placeholder="Describe brevemente qué evalúa este agente..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Criterios de Evaluación */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Criterios de Evaluación</CardTitle>
                <CardDescription>Configura los pesos de cada criterio (total debe sumar 100%)</CardDescription>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${(formData.criteria.experience.weight + formData.criteria.technicalSkills.weight + formData.criteria.education.weight) === 100 ? 'text-green-600' : 'text-red-600'}`}>
                  {formData.criteria.experience.weight + formData.criteria.technicalSkills.weight + formData.criteria.education.weight}%
                </div>
                <div className="text-xs text-muted-foreground">
                  {(formData.criteria.experience.weight + formData.criteria.technicalSkills.weight + formData.criteria.education.weight) === 100 ? '✓ Perfecto' : '✗ Debe sumar 100%'}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profesión */}
            <div className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">1. Profesión</Label>
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="ej. Ingeniería en Sistemas, Administración de Empresas..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">
                  Especifica las profesiones requeridas para el puesto
                </p>
              </div>
            </div>

            {/* Nivel Educativo */}
            <div className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">2. Nivel Educativo</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    className="w-20 text-center"
                    value={formData.criteria.education.weight}
                    onChange={(e) => handleWeightChange('education', parseInt(e.target.value) || 0)}
                  />
                  <span className="text-sm font-medium">%</span>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eduLevel">Nivel Mínimo</Label>
                  <select
                    id="eduLevel"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.criteria.education.minLevel}
                    onChange={(e) => {
                      const newCriteria = { ...formData.criteria };
                      newCriteria.education.minLevel = e.target.value as any;
                      setFormData({ ...formData, criteria: newCriteria });
                    }}
                  >
                    <option value="none">Sin requisito</option>
                    <option value="high-school">Preparatoria</option>
                    <option value="bachelor">Licenciatura</option>
                    <option value="master">Maestría</option>
                    <option value="phd">Doctorado</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eduRequired">¿Es obligatorio?</Label>
                  <select
                    id="eduRequired"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.criteria.education.required ? 'true' : 'false'}
                    onChange={(e) => {
                      const newCriteria = { ...formData.criteria };
                      newCriteria.education.required = e.target.value === 'true';
                      setFormData({ ...formData, criteria: newCriteria });
                    }}
                  >
                    <option value="false">No (Deseable)</option>
                    <option value="true">Sí (Obligatorio)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Experiencia Laboral */}
            <div className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">3. Experiencia Laboral</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    className="w-20 text-center"
                    value={formData.criteria.experience.weight}
                    onChange={(e) => handleWeightChange('experience', parseInt(e.target.value) || 0)}
                  />
                  <span className="text-sm font-medium">%</span>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expYears">Años Mínimos</Label>
                  <Input
                    id="expYears"
                    type="number"
                    min="0"
                    value={formData.criteria.experience.minYears}
                    onChange={(e) => {
                      const newCriteria = { ...formData.criteria };
                      newCriteria.experience.minYears = parseInt(e.target.value) || 0;
                      setFormData({ ...formData, criteria: newCriteria });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expImportance">Importancia</Label>
                  <select
                    id="expImportance"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.criteria.experience.importance}
                    onChange={(e) => {
                      const newCriteria = { ...formData.criteria };
                      newCriteria.experience.importance = e.target.value as any;
                      setFormData({ ...formData, criteria: newCriteria });
                    }}
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Habilidades Técnicas */}
            <div className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">4. Habilidades Técnicas</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    className="w-20 text-center"
                    value={formData.criteria.technicalSkills.weight}
                    onChange={(e) => handleWeightChange('technicalSkills', parseInt(e.target.value) || 0)}
                  />
                  <span className="text-sm font-medium">%</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Habilidades Requeridas (Obligatorias)</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="ej. React, Python, SQL..."
                      value={newRequiredSkill}
                      onChange={(e) => setNewRequiredSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('required'))}
                    />
                    <Button type="button" size="icon" onClick={() => addSkill('required')}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.criteria.technicalSkills.required.map((skill, i) => (
                      <Badge key={i} variant="default" className="gap-1">
                        {skill}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeSkill('required', i)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Habilidades Deseadas (Opcionales)</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="ej. Next.js, GraphQL..."
                      value={newDesiredSkill}
                      onChange={(e) => setNewDesiredSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('desired'))}
                    />
                    <Button type="button" size="icon" onClick={() => addSkill('desired')}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.criteria.technicalSkills.desired.map((skill, i) => (
                      <Badge key={i} variant="secondary" className="gap-1">
                        {skill}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeSkill('desired', i)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Certificaciones</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="ej. AWS Certified, PMP..."
                      value={newCertification}
                      onChange={(e) => setNewCertification(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('certification'))}
                    />
                    <Button type="button" size="icon" onClick={() => addSkill('certification')}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.criteria.technicalSkills.certifications?.map((cert, i) => (
                      <Badge key={i} variant="outline" className="gap-1">
                        {cert}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeSkill('certification', i)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Umbrales de Clasificación */}
        <Card>
          <CardHeader>
            <CardTitle>Umbrales de Clasificación</CardTitle>
            <CardDescription>Define los puntajes para cada clasificación</CardDescription>
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
                  min="0"
                  max="100"
                  value={formData.thresholds.ideal}
                  onChange={(e) => setFormData({
                    ...formData,
                    thresholds: { ...formData.thresholds, ideal: parseInt(e.target.value) || 0 }
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
                  min="0"
                  max="100"
                  value={formData.thresholds.potential}
                  onChange={(e) => setFormData({
                    ...formData,
                    thresholds: { ...formData.thresholds, potential: parseInt(e.target.value) || 0 }
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
                  min="0"
                  max="100"
                  value={formData.thresholds.review}
                  onChange={(e) => setFormData({
                    ...formData,
                    thresholds: { ...formData.thresholds, review: parseInt(e.target.value) || 0 }
                  })}
                />
                <p className="text-xs text-muted-foreground">Revisar manualmente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Prompt - Generado Automáticamente */}
        <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50/50 to-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <CardTitle>System Prompt Generado</CardTitle>
                </div>
                <CardDescription>
                  El prompt se genera automáticamente basándose en los criterios configurados arriba
                </CardDescription>
              </div>
              <Button
                type="button"
                variant={advancedMode ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setAdvancedMode(!advancedMode);
                  if (!advancedMode) {
                    setManualPrompt(generatedPrompt);
                  }
                }}
              >
                {advancedMode ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Modo Avanzado
                  </>
                ) : (
                  <>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Editar Manualmente
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!advancedMode ? (
              <>
                <div className="relative">
                  <Textarea
                    rows={15}
                    value={generatedPrompt}
                    readOnly
                    className="font-mono text-xs bg-gray-50 border-gray-200"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <Eye className="h-3 w-3 mr-1" />
                      Vista Previa
                    </Badge>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900 flex items-start gap-2">
                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>
                      Este prompt se genera automáticamente y se actualiza en tiempo real cuando modificas los criterios arriba.
                      Puedes activar el <strong>Modo Avanzado</strong> para editarlo manualmente si necesitas personalizaciones específicas.
                    </span>
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Editar Prompt Manualmente</Label>
                  <Textarea
                    rows={15}
                    value={manualPrompt}
                    onChange={(e) => setManualPrompt(e.target.value)}
                    className="font-mono text-xs"
                    placeholder="Escribe o edita el prompt manualmente..."
                  />
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-900 flex items-start gap-2">
                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Modo Avanzado activado:</strong> Estás editando el prompt manualmente.
                      Asegúrate de mantener el formato JSON en la respuesta para que funcione correctamente.
                      Puedes desactivar este modo para volver a la generación automática.
                    </span>
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setManualPrompt(generatedPrompt);
                    setAdvancedMode(false);
                  }}
                  className="w-full"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Restaurar Prompt Generado
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-end">
          <Link href="/dashboard/ai-agents">
            <Button type="button" variant="outline" size="lg">
              Cancelar
            </Button>
          </Link>
          <Button 
            type="submit" 
            size="lg"
            disabled={loading || (formData.criteria.experience.weight + formData.criteria.technicalSkills.weight + formData.criteria.education.weight) !== 100}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                Crear Agente
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

