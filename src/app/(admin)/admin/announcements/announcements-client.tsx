'use client';

import dynamic from 'next/dynamic';
import { useState, useTransition } from 'react';
import { createAnnouncement } from '@/app/actions/announcements';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const TipTapEditor = dynamic(() => import('./tiptap-editor'), {
  ssr: false,
  loading: () => (
    <div className="border border-slate-200 rounded-md min-h-[200px] flex items-center justify-center text-sm text-slate-400">
      Loading editor…
    </div>
  ),
});

export interface Level {
  id: string;
  name: string;
}

export interface AnnouncementCard {
  id: string;
  title: string;
  published_at: string;
  target_level_id: string | null;
  read_count: number;
  total_students: number;
  level_name: string | null;
}

interface AnnouncementsClientProps {
  levels: Level[];
  recentAnnouncements: AnnouncementCard[];
  totalStudents: number;
}

export default function AnnouncementsClient({
  levels,
  recentAnnouncements,
  totalStudents,
}: AnnouncementsClientProps) {
  const [title, setTitle] = useState('');
  const [targetLevelId, setTargetLevelId] = useState<string>('all');
  const [bodyHtml, setBodyHtml] = useState('');
  const [editorKey, setEditorKey] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [history, setHistory] = useState<AnnouncementCard[]>(recentAnnouncements);

  const handlePublish = () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    const stripped = bodyHtml.replace(/<[^>]*>?/gm, '').trim();
    if (!stripped) {
      toast.error('Message body is required');
      return;
    }
    startTransition(async () => {
      const result = await createAnnouncement({
        title: title.trim(),
        body_html: bodyHtml,
        target_level_id: targetLevelId === 'all' ? undefined : targetLevelId,
        publish_now: true,
      });
      if (result.ok) {
        toast.success('Announcement published');
        const levelName =
          targetLevelId === 'all'
            ? null
            : (levels.find(l => l.id === targetLevelId)?.name ?? null);
        const newCard: AnnouncementCard = {
          id: result.data.announcement_id,
          title: title.trim(),
          published_at: result.data.published_at ?? new Date().toISOString(),
          target_level_id: targetLevelId === 'all' ? null : targetLevelId,
          read_count: 0,
          total_students: totalStudents,
          level_name: levelName,
        };
        setHistory(prev => [newCard, ...prev].slice(0, 5));
        setTitle('');
        setTargetLevelId('all');
        setBodyHtml('');
        setEditorKey(k => k + 1);
      } else {
        toast.error('message' in result ? (result as { message?: string }).message ?? 'Failed to publish' : 'Failed to publish');
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
      {/* Left: Compose */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-5">
        <h2 className="text-lg font-semibold text-slate-900">Compose Announcement</h2>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            Title <span className="text-red-500">*</span>
          </label>
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Upcoming Assessment on Friday"
            className="h-9"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Target Audience</label>
          <Select value={targetLevelId} onValueChange={v => setTargetLevelId(v ?? 'all')}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {levels.map(l => (
                <SelectItem key={l.id} value={l.id}>
                  {l.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Message</label>
          <TipTapEditor key={editorKey} onChange={setBodyHtml} />
        </div>

        <Button
          onClick={handlePublish}
          disabled={isPending}
          className="w-full bg-green-800 hover:bg-green-700 text-white"
        >
          {isPending ? 'Publishing…' : 'Publish Announcement'}
        </Button>
      </div>

      {/* Right: History + Insights */}
      <div className="space-y-4">
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Recent Announcements</h2>
          {history.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No announcements yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {history.map(ann => {
                const pct =
                  ann.total_students > 0
                    ? Math.min(100, Math.round((ann.read_count / ann.total_students) * 100))
                    : 0;
                return (
                  <div key={ann.id} className="py-3 first:pt-0 last:pb-0 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-slate-900 line-clamp-1">
                        {ann.title}
                      </p>
                      {ann.level_name && (
                        <span className="shrink-0 inline-flex items-center rounded-full bg-green-800/10 px-2 py-0.5 text-xs font-medium text-green-800">
                          {ann.level_name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      {formatDistanceToNow(new Date(ann.published_at), { addSuffix: true })}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-800 rounded-full transition-[width] duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 tabular-nums shrink-0">
                        {ann.read_count}/{ann.total_students}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Engagement Insights */}
        <div className="bg-green-800/5 rounded-lg border border-green-800/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-800" />
            <h3 className="text-sm font-semibold text-green-800">Engagement Insights</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Announcements sent on{' '}
            <span className="font-medium">Tuesday mornings</span> have a{' '}
            <span className="font-medium text-green-800">25% higher read rate</span> compared to
            other days.
          </p>
        </div>
      </div>
    </div>
  );
}
