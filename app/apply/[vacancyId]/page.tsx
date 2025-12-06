'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Briefcase, MapPin, DollarSign, CheckCircle2, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default function ApplyPage({ params }: { params: { vacancyId: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [vacancy, setVacancy] = useState<any>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    cv: null as File | null
  });
  const countryCodes = [
    { code: '+52', name: 'México' },
    { code: '+504', name: 'Honduras' },
    { code: '+1', name: 'EE.UU./Miami' },
    { code: '+54', name: 'Argentina' },
    { code: '+507', name: 'Panamá' },
  ];
  const [selectedCode, setSelectedCode] = useState(countryCodes[0].code);
  
  useEffect(() => {
    fetchVacancy();
  }, [params.vacancyId]);
  
  const fetchVacancy = async () => {
    try {
      const response = await axios.get(`/api/vacancies/${params.vacancyId}`);
      if (response.data.success) {
        setVacancy(response.data.data);
        
        if (response.data.data.status !== 'published') {
          setError('Esta vacante no está disponible actualmente.');
        }
      }
    } catch (error) {
      setError('No se pudo cargar la información de la vacante.');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (!formData.cv) {
        setError('Por favor selecciona tu CV');
        setLoading(false);
        return;
      }
      
      const formDataToSend = new FormData();
      formDataToSend.append('vacancyId', params.vacancyId);
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('email', formData.email);
      // Concatenar el código de país seleccionado con el número
      formDataToSend.append('phone', `${selectedCode}${formData.phone}`);
      formDataToSend.append('cv', formData.cv);
      
      const response = await axios.post('/api/applications', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        setSuccess(true);
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error al enviar la aplicación');
    } finally {
      setLoading(false);
    }
  };
  
  if (!vacancy && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-pulse text-lg">Cargando...</div>
      </div>
    );
  }
  
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl">¡Aplicación Enviada!</CardTitle>
            <CardDescription>
              Gracias por tu interés en esta posición
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-center text-muted-foreground">
              Hemos recibido tu aplicación y nuestro equipo la revisará pronto. 
              Te contactaremos por email o WhatsApp con los próximos pasos.
            </p>
            <Button 
              className="w-full" 
              onClick={() => router.push('/')}
            >
              Ver Más Vacantes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/vacancies">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver a Vacantes
            </Button>
          </Link>
        </div>

        {/* Vacancy Info */}
        {vacancy && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-3xl mb-2">{vacancy.title}</CardTitle>
                  <CardDescription className="text-base">
                    {vacancy.department}
                  </CardDescription>
                </div>
                <Badge className="ml-4 bg-green-100 text-green-800">
                  Activa
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{vacancy.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    {formatCurrency(vacancy.salary.min)} - {formatCurrency(vacancy.salary.max)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm capitalize">{vacancy.employmentType}</span>
                </div>
              </div>
              
              <div className="pt-4">
                <h4 className="font-semibold mb-2">Descripción del Puesto</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {vacancy.optimizedDescription || vacancy.description}
                </p>
              </div>
              
              {vacancy.requiredSkills && vacancy.requiredSkills.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Habilidades Requeridas</h4>
                  <div className="flex flex-wrap gap-2">
                    {vacancy.requiredSkills.map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Application Form */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Postular a esta Vacante</CardTitle>
            <CardDescription>
              Completa el formulario y nuestro equipo revisará tu aplicación
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {error && vacancy?.status === 'published' && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            
            {error && vacancy?.status !== 'published' && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">{error}</p>
              </div>
            )}
            
            {vacancy?.status === 'published' && (
              <form onSubmit={handleSubmit} className="flex flex-col flex-1">
                <div className="space-y-6 flex-1">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nombre Completo *</Label>
                    <Input
                      id="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      placeholder="Juan Pérez"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="juan@ejemplo.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono *</Label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select
                        value={selectedCode}
                        onChange={e => setSelectedCode(e.target.value)}
                        style={{ minWidth: 90 }}
                        required
                      >
                        {countryCodes.map(c => (
                          <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                        ))}
                      </select>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="95697301"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cv">CV (PDF) *</Label>
                    <Input
                      id="cv"
                      type="file"
                      required
                      accept=".pdf"
                      onChange={(e) => setFormData({...formData, cv: e.target.files?.[0] || null})}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">
                      Sube tu CV en formato PDF (máximo 10 MB)
                    </p>
                  </div>
                </div>
                
                {/* Botón fijo al final */}
                <div className="mt-6 space-y-4 pt-6 border-t">
                  {/* Mensaje de progreso mientras analiza */}
                  {loading && (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Analizando tu CV con Inteligencia Artificial
                          </p>
                          <p className="text-xs text-blue-700 mt-2">
                            Estamos extrayendo el contenido de tu CV y analizándolo con nuestro agente especializado. 
                            Esto puede tomar entre 10-20 segundos...
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <Link href="/vacancies" className="flex-1">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full gap-2"
                        size="lg"
                        disabled={loading}
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Cancelar
                      </Button>
                    </Link>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Analizando CV...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-5 w-5" />
                          Enviar Aplicación
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <p className="text-xs text-center text-muted-foreground">
                    Al enviar tu aplicación, aceptas que procesemos tu información para fines de reclutamiento.
                  </p>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

