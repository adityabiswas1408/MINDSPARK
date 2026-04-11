'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { updateLevelOrder } from '@/app/actions/levels';
import { GripVertical } from 'lucide-react';
import { CreateLevelDialog } from './create-level-dialog';

export interface LevelItem {
  id: string;
  name: string;
  sequence_order: number;
  deleted_at: string | null;
  enrolled_count: number;
}

interface LevelsClientProps {
  levels: LevelItem[];
  nextSequenceOrder: number;
}

export function LevelsClient({ levels: initialLevels, nextSequenceOrder }: LevelsClientProps) {
  const router = useRouter();
  const [levels, setLevels] = useState(initialLevels);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setLevels(initialLevels);
  }, [initialLevels]);

  function handleDragEnd(result: DropResult) {
    if (!result.destination || result.destination.index === result.source.index) return;

    const reordered = Array.from(levels);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    const updated = reordered.map((l, i) => ({ ...l, sequence_order: i + 1 }));

    // Optimistic update
    setLevels(updated);

    startTransition(async () => {
      const res = await updateLevelOrder(
        updated.map((l) => ({ id: l.id, sequence_order: l.sequence_order })),
      );
      if (!res.ok) {
        setLevels(initialLevels);
      }
      router.refresh();
    });
  }

  const totalStudents = levels.reduce((sum, l) => sum + l.enrolled_count, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-green-800">Levels</h1>
        <CreateLevelDialog nextSequenceOrder={nextSequenceOrder} />
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="levels-list">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-2"
            >
              {levels.map((level, index) => {
                const isActive = level.deleted_at === null;
                return (
                  <Draggable key={level.id} draggableId={level.id} index={index}>
                    {(dragProvided, snapshot) => (
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        className={`flex items-center gap-3 p-4 bg-card rounded-md border border-slate-200 transition-shadow ${
                          snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'
                        }`}
                      >
                        <div
                          {...dragProvided.dragHandleProps}
                          className="text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing shrink-0"
                        >
                          <GripVertical className="h-5 w-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-primary">{level.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {level.enrolled_count} student{level.enrolled_count !== 1 ? 's' : ''} enrolled
                          </p>
                        </div>

                        <span className="text-xs font-mono text-slate-400 tabular-nums shrink-0">
                          #{level.sequence_order}
                        </span>

                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium shrink-0 ${
                            isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isActive ? 'Active' : 'Archived'}
                        </span>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Stats row — one tile with a real DB metric. The prior
          'Avg Competencies' and 'Curriculum Density' tiles were fake
          placeholders (0 / —) with no DB backing. Removed per
          UI_DIAGNOSTIC_REPORT.md Fake Data Inventory. */}
      <div className="pt-2">
        <div className="rounded-md border border-slate-200 bg-card p-4 text-center max-w-[240px]">
          <p className="text-2xl font-bold font-mono tabular-nums text-primary">{totalStudents}</p>
          <p className="text-xs text-slate-500 mt-1">Total Student Load</p>
        </div>
      </div>
    </div>
  );
}
