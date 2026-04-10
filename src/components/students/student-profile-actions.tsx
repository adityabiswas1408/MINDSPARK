'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateStudent, deactivateStudent } from '@/app/actions/students';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';

export interface ProfileLevel {
  id: string;
  name: string;
  sequence_order: number;
}

interface StudentProfileActionsProps {
  studentId: string;
  currentLevelId: string | null;
  isInactive: boolean;
  levels: ProfileLevel[];
}

export function StudentProfileActions({
  studentId,
  currentLevelId,
  isInactive,
  levels,
}: StudentProfileActionsProps) {
  const router = useRouter();
  const [promoteLevelId, setPromoteLevelId] = useState(currentLevelId ?? '');
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState('');

  function handlePromote() {
    if (!promoteLevelId || promoteLevelId === currentLevelId) return;
    startTransition(async () => {
      const result = await updateStudent({ student_id: studentId, level_id: promoteLevelId });
      if (!result.ok) {
        setMessage(result.message ?? result.error ?? 'Promote failed.');
      } else {
        setMessage('Level updated.');
        router.refresh();
      }
    });
  }

  function handleSuspend() {
    startTransition(async () => {
      const result = await deactivateStudent({ student_id: studentId });
      if (!result.ok) {
        setMessage(result.message ?? result.error ?? 'Suspend failed.');
      } else {
        setMessage('Student suspended.');
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-3">
      {/* Promote */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Promote to Level</p>
        <div className="flex gap-2">
          <Select
            value={promoteLevelId}
            onValueChange={(v) => v && setPromoteLevelId(v)}
          >
            <SelectTrigger className="h-9 flex-1 text-sm">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              {levels.map((l) => (
                <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            className="h-9 bg-green-800 hover:bg-green-700 text-white text-sm shrink-0"
            onClick={handlePromote}
            disabled={isPending || !promoteLevelId || promoteLevelId === currentLevelId}
          >
            Promote
          </Button>
        </div>
      </div>

      {/* Suspend */}
      {!isInactive && (
        <Button
          variant="outline"
          className="w-full border-red-200 text-red-700 hover:bg-red-50 text-sm"
          onClick={handleSuspend}
          disabled={isPending}
        >
          Suspend Student
        </Button>
      )}

      {/* Reset Password — placeholder */}
      <Button
        variant="outline"
        className="w-full text-slate-600 text-sm"
        disabled
      >
        Reset Password (coming soon)
      </Button>

      {message && (
        <p className="text-xs text-slate-500">{message}</p>
      )}
    </div>
  );
}
