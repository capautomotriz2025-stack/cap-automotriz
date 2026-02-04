'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, Phone, FileText, MessageSquare, Loader2, Download, Eye } from 'lucide-react';
import { getClassificationColor, getScoreColor, getStatusColor } from '@/lib/utils';
import Link from 'next/link';

export default function CandidateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generatingInterview, setGeneratingInterview] = useState(false);
  const [generatingCV, setGeneratingCV] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchCandidate();
    }
  }, [params.id]);

  const fetchCandidate = async () => {
    try {
      const response = await axios.get(`/api/candidates/${params.id}`);
      if (response.data.success) {
        setCandidate(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching candidate:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInterview = async () => {
    setGeneratingInterview(true);
    try {
      const response = await axios.post(`/api/candidates/${params.id}/generate-interview`);
      if (response.data.success && response.data.data.pdfUrl) {
        window.open(response.data.data.pdfUrl, '_blank');
      }
    } catch (error) {
      console.error('Error generando entrevista:', error);
      alert('Error al generar entrevista');
    } finally {
      setGeneratingInterview(false);
    }
  };

  const handleGenerateCV = async () => {
    if (!candidate.genericCV) {
      setGeneratingCV(true);
      try {
        const response = await axios.post(`/api/candidates/${params.id}/generate-cv`);
        if (response.data.success) {
          setCandidate({ ...candidate, genericCV: response.data.data });
        }
      } catch (error) {
        console.error('Error generando CV genérico:', error);
        alert('Error al generar CV genérico');
      } finally {
        setGeneratingCV(false);
      }
    }
    if (candidate.genericCV?.pdfUrl) {
      window.open(candidate.genericCV.pdfUrl, '_blank');
    }
  };

  if (loading) {
    return <div className="animate-pulse">Cargando candidato...</div>;
  }

  if (!candidate) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/candidates">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-gray-500">Candidato no encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/candidates">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-black text-white">{candidate.fullName}</h1>
          <p className="text-cap-gray-lightest mt-1 font-semibold">
            {candidate.vacancyId?.title || 'Vacante no disponible'}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Información Principal */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Candidato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-cap-gray" />
              <span className="text-cap-gray-lightest font-semibold">{candidate.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-cap-gray" />
              <span className="text-cap-gray-lightest font-semibold">{candidate.phone}</span>
            </div>
            <div className="flex gap-2">
              <Badge className={`${getStatusColor(candidate.status)} font-bold border`}>
                {candidate.status}
              </Badge>
              <Badge className={`${getClassificationColor(candidate.aiClassification)} text-white font-bold border`}>
                {candidate.aiClassification}
              </Badge>
            </div>
            <div className="pt-4 border-t">
              <div className={`text-3xl font-black ${getScoreColor(candidate.aiScore)}`}>
                {candidate.aiScore}
              </div>
              <div className="text-sm text-cap-gray-lightest font-bold">Puntaje IA</div>
            </div>
          </CardContent>
        </Card>

        {/* Acciones */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones</CardTitle>
            <CardDescription>Gestiona el CV y genera la entrevista</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <a href={candidate.cvUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button variant="outline" className="w-full border-2 border-cap-gray text-cap-gray-lightest hover:border-cap-red hover:text-cap-red font-bold">
                  <Eye className="w-4 h-4 mr-2" />
                  Ver CV Original
                </Button>
              </a>
            </div>
            <Button
              variant="outline"
              onClick={handleGenerateCV}
              disabled={generatingCV}
              className="w-full border-2 border-cap-gray text-cap-gray-lightest hover:border-cap-red hover:text-cap-red font-bold disabled:opacity-50"
            >
              {generatingCV ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  {candidate.genericCV ? 'Ver CV Genérico' : 'Generar CV Genérico'}
                </>
              )}
            </Button>
            {candidate.genericCV?.pdfUrl && (
              <a href={candidate.genericCV.pdfUrl} download className="block">
                <Button variant="outline" className="w-full border-2 border-cap-gray text-cap-gray-lightest hover:border-cap-red hover:text-cap-red font-bold">
                  <Download className="w-4 h-4 mr-2" />
                  Descargar CV Genérico
                </Button>
              </a>
            )}
            <Button
              onClick={handleGenerateInterview}
              disabled={generatingInterview}
              className="w-full bg-racing-gradient hover:scale-105 transition-transform shadow-racing font-bold"
            >
              {generatingInterview ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Generar y Descargar Entrevista
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Análisis de IA */}
      {candidate.aiJustification && (
        <Card>
          <CardHeader>
            <CardTitle>Análisis de IA</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-cap-gray-lightest font-semibold">{candidate.aiJustification}</p>
          </CardContent>
        </Card>
      )}

      {/* CV Genérico */}
      {candidate.genericCV && (
        <Card>
          <CardHeader>
            <CardTitle>CV Genérico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {candidate.genericCV.summary?.map((point: string, index: number) => (
                <p key={index} className="text-cap-gray-lightest font-semibold">
                  {index + 1}. {point}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
