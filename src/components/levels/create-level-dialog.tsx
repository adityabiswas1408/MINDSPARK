'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createLevel } from '@/app/actions/levels';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { PlusCircle } from 'lucide-react';

interface CreateLevelDialogProps {
  nextSequenceOrder: number;
}

export function CreateLevelDialog({ nextSequenceOrder }: CreateLevelDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Level name is required.');
      return;
    }
    setError('');
    startTransition(async () => {
      const result = await createLevel({
        name: name.trim(),
        sequence_order: nextSequenceOrder,
      });
      if (!result.ok) {
        setError(result.message ?? 'Failed to create level.');
        return;
      }
      setOpen(false);
      setName('');
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button className="bg-green-800 hover:bg-green-700 text-white gap-2" />}
      >
        <PlusCircle className="h-4 w-4" />
        Create Level
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Level</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="level-name">Level Name *</Label>
            <Input
              id="level-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Level 2"
              autoFocus
            />
          </div>
          <p className="text-xs text-slate-400">
            Will be assigned sequence order: {nextSequenceOrder}
          </p>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-green-800 hover:bg-green-700 text-white"
            >
              {isPending ? 'Creating…' : 'Create Level'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
