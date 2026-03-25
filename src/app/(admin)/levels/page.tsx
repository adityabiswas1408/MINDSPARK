import { createClient } from '@/lib/supabase/server';
import { EmptyState } from '@/components/shared/empty-state';
import { Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function AdminLevelsPage() {
  const supabase = await createClient();
  const { data: levels } = await supabase.from('levels').select('*').order('sequence_order', { ascending: true });

  if (!levels || levels.length === 0) {
    return (
      <div className="max-w-xl mx-auto mt-12">
        <EmptyState 
          icon={<Layers size={48} />}
          title="No Levels Found"
          description="Create your first academic level to get started organizing your students and assessments."
          action={<Button>Create Level</Button>}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-green-800">Levels</h1>
        <Button>Create Level</Button>
      </div>
      <div className="space-y-2">
        {levels.map((level) => (
          <div key={level.id} className="p-4 bg-card rounded-md shadow-sm border border-slate-200 flex justify-between items-center outline-none focus-within:ring-2 focus-within:ring-green-800">
            <span className="font-medium text-primary">{level.name}</span>
            <span className="text-sm text-secondary font-mono">Sequence: {level.sequence_order}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
