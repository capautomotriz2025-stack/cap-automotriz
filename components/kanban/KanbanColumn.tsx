'use client';

import { useDroppable } from '@dnd-kit/core';
import { ICandidate } from '@/models/Candidate';
import CandidateCard from './CandidateCard';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  candidates: ICandidate[];
}

export default function KanbanColumn({ id, title, color, candidates }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });
  
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col min-w-[280px] max-w-[320px] rounded-lg border-2 transition-colors",
        color,
        isOver && "ring-2 ring-primary ring-offset-2"
      )}
    >
      <div className="p-4 border-b bg-white/50 rounded-t-lg">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {candidates.length} candidato{candidates.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {candidates.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            Sin candidatos
          </div>
        ) : (
          candidates.map((candidate) => (
            <CandidateCard key={candidate._id.toString()} candidate={candidate} />
          ))
        )}
      </div>
    </div>
  );
}

