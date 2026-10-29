import React from 'react';
import { History, RefreshCw, PhoneIncoming, PhoneOutgoing, CheckCircle2, Clock } from 'lucide-react';
import { useVoiceAgent } from '../../../contexts/VoiceAgentContext';

const CallHistoryTable = () => {
  const { callHistory, fetchHistory } = useVoiceAgent();

  const dummyHistory = [
    { sid: 'CA98234a1b82', from: '+1 (888) 459-7862', to: '+1 (415) 890-2341', status: 'completed', duration: '02:14', timestamp: 'Today, 03:20 PM' },
    { sid: 'CA77123f9901', from: '+1 (800) 234-5678', to: '+1 (212) 555-0199', status: 'completed', duration: '01:45', timestamp: 'Today, 01:10 PM' },
    { sid: 'CA55019d2834', from: '+1 (888) 990-1122', to: '+1 (312) 555-0188', status: 'completed', duration: '04:02', timestamp: 'Yesterday, 05:45 PM' },
  ];

  const displayCalls = callHistory.length > 0 ? callHistory : dummyHistory;

  return (
    <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xl mt-8">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-800/60 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Call Log History (GET /calls)
            </h3>
            <p className="text-[11px] text-slate-500">
              Backend Dashboard Telemetry
            </p>
          </div>
        </div>

        <button
          onClick={fetchHistory}
          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <th className="py-2.5 px-3">Call SID</th>
              <th className="py-2.5 px-3">From</th>
              <th className="py-2.5 px-3">To</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Duration</th>
              <th className="py-2.5 px-3">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
            {displayCalls.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                <td className="py-3 px-3 font-bold text-indigo-600 dark:text-indigo-400">
                  {item.sid || item.callSid || 'CA-102948'}
                </td>
                <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                  {item.from || item.fromNumber}
                </td>
                <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                  {item.to || item.toNumber}
                </td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200 dark:border-emerald-800/60 font-sans">
                    {item.status || 'completed'}
                  </span>
                </td>
                <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                  {item.duration || '02:14'}
                </td>
                <td className="py-3 px-3 text-slate-400 font-sans text-[11px]">
                  {item.timestamp || 'Just now'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CallHistoryTable;
