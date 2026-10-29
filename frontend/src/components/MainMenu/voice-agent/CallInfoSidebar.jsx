import React from 'react';
import { ShieldCheck, Phone, Cpu, Database, Award, Activity, Lock, Globe } from 'lucide-react';
import { useVoiceAgent } from '../../../contexts/VoiceAgentContext';

const CallInfoSidebar = () => {
  const { fromNumber, toNumber, callSid, sttProvider, ttsProvider, aiEngine } = useVoiceAgent();

  return (
    <div className="glass-card rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="border-b border-slate-200/60 dark:border-slate-800/60 pb-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-500" />
          Call Session Metadata
        </h3>
        <p className="text-[11px] text-slate-500">
          Twilio SIP & AI Model Diagnostics
        </p>
      </div>

      {/* Connected Numbers */}
      <div className="space-y-3 text-xs">
        <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            From (Caller ID)
          </span>
          <span className="font-mono font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-indigo-500" />
            {fromNumber}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            To (Prospect Line)
          </span>
          <span className="font-mono font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-purple-500" />
            {toNumber}
          </span>
        </div>
      </div>

      {/* AI Pipeline Architecture */}
      <div className="space-y-2.5 pt-2">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          AI Pipeline Stack
        </h4>
        
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-indigo-500" /> AI Core:
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">{aiEngine}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-blue-500" /> STT Engine:
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">{sttProvider}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-purple-500" /> TTS Voice:
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">{ttsProvider}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-emerald-500" /> Locale:
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">en-US (Multilingual)</span>
          </div>
        </div>
      </div>

      {/* Real-time Telemetry Scores */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Real-Time Intent Analytics
        </h4>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-600 dark:text-slate-400">Intent Confidence</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">98.4%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full w-[98%]"></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-600 dark:text-slate-400">Sentiment Score</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">+0.89 (Positive)</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full w-[89%]"></div>
          </div>
        </div>
      </div>

      {/* Security Badge */}
      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <Lock className="w-3.5 h-3.5 text-emerald-500" /> SRTP Encrypted
        </span>
        <span>HIPAA / SOC2</span>
      </div>

    </div>
  );
};

export default CallInfoSidebar;
