'use client';

import { use } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2 } from 'lucide-react';

export default function StudentLobbyPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  
  const playMetronome = () => {
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      const playBeep = (timeFromNow: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime + timeFromNow); // 880Hz
        
        gain.gain.setValueAtTime(0, ctx.currentTime + timeFromNow);
        gain.gain.linearRampToValueAtTime(1, ctx.currentTime + timeFromNow + 0.01);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + timeFromNow + 0.08); // 80ms tone
        
        osc.start(ctx.currentTime + timeFromNow);
        osc.stop(ctx.currentTime + timeFromNow + 0.1);
      };

      // 3 beats at 500ms, 1000ms, 1500ms
      playBeep(0.5);
      playBeep(1.0);
      playBeep(1.5);
    } catch (e) {
      console.error('Audio API not supported', e);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 text-center space-y-8">
      <h1 className="text-3xl font-bold text-green-800">Exam Lobby</h1>
      <p className="text-secondary">Waiting for the teacher to start the exam: {params.id}</p>
      
      <div className="p-6 bg-card rounded-md border border-slate-200">
        <h2 className="text-lg font-semibold mb-4 text-primary">Audio Test</h2>
        <p className="text-sm text-slate-500 mb-6">
          Flash Anzan exams require sound. Click below to test your audio. You should hear 3 rapid beeps.
        </p>
        <Button onClick={playMetronome} variant="outline" className="w-full font-bold">
          <Volume2 className="mr-2 h-4 w-4" /> Test Audio
        </Button>
      </div>
    </div>
  );
}
