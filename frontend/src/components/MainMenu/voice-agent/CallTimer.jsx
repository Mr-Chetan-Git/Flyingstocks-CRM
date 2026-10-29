import React from 'react';
import { Clock } from 'lucide-react';

const CallTimer = ({ formattedTime = '00:00', isPaused = false }) => {
  return (
    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-900 text-white font-mono text-sm shadow-md border border-slate-800">
      <span className={`w-2.5 h-2.5 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-red-500 animate-pulse'}`}></span>
      <Clock className="w-4 h-4 text-slate-400" />
      <span className="font-bold tracking-wider">{formattedTime}</span>
      {isPaused && <span className="text-[10px] uppercase font-sans text-amber-400 font-bold">(PAUSED)</span>}
    </div>
  );
};

export default CallTimer;
