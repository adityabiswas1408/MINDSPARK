'use client';

import { AlertTriangle } from 'lucide-react';

export function NetworkBanner() {
  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className="fixed top-0 left-0 w-full bg-[#FEF9C3] border-b-4 border-[#F59E0B] z-[9999] px-4 py-3 shadow-md flex items-center justify-center transform transition-transform"
    >
      <AlertTriangle className="text-[#854D0E] mr-3" size={20} aria-hidden="true" />
      <span className="font-sans text-[15px] font-bold text-[#854D0E]">
        The network is taking a quick break. Test paused. Teacher knows.
      </span>
    </div>
  );
}
