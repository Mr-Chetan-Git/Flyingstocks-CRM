import React from 'react';
import { ShieldCheck, Cpu, Wifi, Globe, Activity } from 'lucide-react';
import CallTimer from './CallTimer';

const StatusCards = ({ 
  callSid, 
  formattedTime, 
  isPaused,
  networkLatency = '14ms', 
  provider = 'Twilio Voice', 
  aiEngine = 'Gemini 1.5 Flash' 
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-6">
      
      {/* Card 1: Call SID & Status */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-indigo-500" />
          Twilio Call SID
        </span>
        <div className="mt-2 font-mono text-xs font-bold text-slate-900 dark:text-white truncate" title={callSid}>
          {callSid ? `${callSid.substring(0, 14)}...` : 'CA-Initiating'}
        </div>
      </div>

      {/* Card 2: Duration Timer */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Duration
        </span>
        <div className="mt-1">
          <CallTimer formattedTime={formattedTime} isPaused={isPaused} />
        </div>
      </div>

      {/* Card 3: AI Engine Provider */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-purple-500" />
          AI Gateway
        </span>
        <div className="mt-1 text-xs font-bold text-slate-900 dark:text-white truncate">
          {aiEngine}
        </div>
      </div>

      {/* Card 4: Network Latency */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Wifi className="w-3.5 h-3.5 text-emerald-500" />
          Stream Latency
        </span>
        <div className="mt-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          {networkLatency}
        </div>
      </div>

    </div>
  );
};

export default StatusCards;
