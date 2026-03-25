'use client';

import { useEffect, useState, use } from 'react';
import { createClient } from '@/lib/supabase/client';

const JITTER_WINDOW_MS = 2000;

export default function AdminMonitorPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const paperId = params.id;
  
  const [status, setStatus] = useState<Record<string, 'active' | 'offline' | 'submitted'>>({});

  useEffect(() => {
    const supabase = createClient();
    
    // Broadcast for lifecycle events
    const examChannel = supabase.channel(`exam:${paperId}`);
    examChannel.on('broadcast', { event: 'lifecycle' }, (payload) => {
      if (payload.payload?.status === 'submitted' && payload.payload?.student_id) {
        setStatus(prev => ({ ...prev, [payload.payload.student_id]: 'submitted' }));
      }
    });

    // Presence for student status in Lobby
    const lobbyChannel = supabase.channel(`lobby:${paperId}`);
    lobbyChannel.on('presence', { event: 'sync' }, () => {
      // Sync events when joining — handle active presences
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      setStatus(prev => {
        const studentId = leftPresences?.[0]?.student_id || key;
        const current = prev[studentId];
        // Rules: Submitted status permanently green — never overwritten by Presence leave
        if (current === 'submitted') return prev;
        return { ...prev, [studentId]: 'offline' };
      });
    });

    // Rules: WebSocket connect wrapped in setTimeout(() => channel.subscribe(), Math.random() * JITTER_WINDOW_MS)
    const timer = setTimeout(() => {
      examChannel.subscribe();
      lobbyChannel.subscribe();
    }, Math.random() * JITTER_WINDOW_MS);

    return () => {
      clearTimeout(timer);
      supabase.removeChannel(examChannel);
      supabase.removeChannel(lobbyChannel);
    };
  }, [paperId]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-green-800">Live Monitor</h1>
      <div className="p-4 bg-card rounded-md border border-slate-200">
        <p className="text-secondary mb-4">Monitoring Paper: <span className="font-mono">{paperId}</span></p>
        {Object.keys(status).length === 0 ? (
          <p className="text-sm text-slate-500">No students connected yet.</p>
        ) : (
          <ul className="space-y-2">
            {Object.entries(status).map(([studentId, state]) => (
              <li key={studentId} className="flex items-center space-x-2">
                <span className={`h-2 w-2 rounded-full ${state === 'submitted' ? 'bg-green-500' : state === 'active' ? 'bg-blue-500' : 'bg-red-500'}`} />
                <span className="font-mono text-sm">{studentId}</span>
                <span className="text-xs uppercase text-slate-500">{state}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
