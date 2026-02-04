'use client';

import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { ICandidate } from '@/models/Candidate';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getClassificationColor, getScoreColor } from '@/lib/utils';
import { Mail, Phone, FileText, MessageSquare, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';

interface CandidateCardProps {
  candidate: ICandidate;
  isDragging?: boolean;
}

export default function CandidateCard({ candidate, isDragging = false }: CandidateCardProps) {
  const [generatingInterview, setGeneratingInterview] = useState(false);
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: candidate._id.toString(),
  });
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;
  
  const handleGenerateInterview = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setGeneratingInterview(true);
    try {
      const response = await axios.post(`/api/candidates/${candidate._id}/generate-interview`);
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
  
  const classificationColors = {
    'ideal': 'bg-green-100 text-green-800 border-green-300',
    'potencial': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'no perfila': 'bg-red-100 text-red-800 border-red-300',
  };
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50"
      )}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <h4 className="font-semibold text-sm line-clamp-1">{candidate.fullName}</h4>
              <div className={cn(
                "text-lg font-bold",
                getScoreColor(candidate.aiScore)
              )}>
                {candidate.aiScore}
              </div>
            </div>
            
            {/* Classification Badge */}
            <Badge 
              className={cn(
                "text-xs",
                classificationColors[candidate.aiClassification]
              )}
            >
              {candidate.aiClassification}
            </Badge>
            
            {/* Contact Info */}
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="w-3 h-3" />
                <span className="line-clamp-1">{candidate.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3" />
                <span>{candidate.phone}</span>
              </div>
            </div>
            
            {/* AI Justification */}
            {candidate.aiJustification && (
              <p className="text-xs text-muted-foreground line-clamp-2 italic">
                {candidate.aiJustification}
              </p>
            )}
            
            {/* Actions */}
            <div className="pt-2 border-t space-y-2">
              <a
                href={candidate.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                <FileText className="w-3 h-3" />
                Ver CV
              </a>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateInterview}
                disabled={generatingInterview}
                className="w-full text-xs h-7"
              >
                {generatingInterview ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-3 h-3 mr-1" />
                    Generar Entrevista
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

