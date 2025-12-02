'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { ICandidate } from '@/models/Candidate';
import KanbanColumn from './KanbanColumn';
import CandidateCard from './CandidateCard';

const COLUMNS = [
  { id: 'applied', title: 'Aplicados', color: 'bg-gray-50 border-gray-200' },
  { id: 'screening', title: 'Screening', color: 'bg-blue-50 border-blue-200' },
  { id: 'interview', title: 'Entrevista', color: 'bg-yellow-50 border-yellow-200' },
  { id: 'evaluation', title: 'Evaluación', color: 'bg-purple-50 border-purple-200' },
  { id: 'offer', title: 'Oferta', color: 'bg-green-50 border-green-200' },
  { id: 'hired', title: 'Contratado', color: 'bg-emerald-50 border-emerald-200' },
  { id: 'rejected', title: 'Rechazado', color: 'bg-red-50 border-red-200' }
];

interface KanbanBoardProps {
  candidates: ICandidate[];
  onUpdateStatus: (candidateId: string, newStatus: string) => Promise<void>;
}

export default function KanbanBoard({ candidates, onUpdateStatus }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
  
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };
  
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const candidateId = active.id as string;
      const newStatus = over.id as string;
      
      // Verificar si el drop target es una columna válida
      if (COLUMNS.find(col => col.id === newStatus)) {
        await onUpdateStatus(candidateId, newStatus);
      }
    }
    
    setActiveId(null);
  };
  
  const getCandidatesByStatus = (status: string) => {
    return candidates.filter(c => c.status === status);
  };
  
  const activeCandidate = activeId 
    ? candidates.find(c => c._id.toString() === activeId)
    : null;
  
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-12rem)]">
        {COLUMNS.map(column => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            color={column.color}
            candidates={getCandidatesByStatus(column.id)}
          />
        ))}
      </div>
      
      <DragOverlay>
        {activeCandidate && (
          <div className="rotate-3 opacity-90">
            <CandidateCard candidate={activeCandidate} isDragging />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

