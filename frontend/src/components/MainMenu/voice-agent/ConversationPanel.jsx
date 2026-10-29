import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Bot, User, Sparkles, Activity, ShieldAlert } from 'lucide-react';
import { useVoiceAgent } from '../../../contexts/VoiceAgentContext';

const ConversationPanel = () => {
  const { messages } = useVoiceAgent();
  const scrollRef = useRef(null);

  // Auto scroll to bottom when new transcript message arrives
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="glass-card rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xl flex flex-col h-[520px] relative overflow-hidden">
      
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-800/60 mb-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Live Transcript & Timeline
            </h3>
            <p className="text-[11px] text-slate-500">
              Real-time STT / TTS Stream Payload
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          Streaming Active
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="flex-grow overflow-y-auto space-y-3.5 pr-2 custom-scrollbar">
        
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 py-12 text-center">
            <Sparkles className="w-8 h-8 text-indigo-400/50 mb-3 animate-pulse" />
            <p className="text-xs font-medium">Connecting to audio stream...</p>            <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
              Live transcript entries will stream here as speech events are emitted.
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((item) => {
              if (item.sender === 'System') {
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center my-2"
                  >
                    <div className="px-3 py-1 rounded-full bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200/50 dark:border-indigo-800/50 text-[11px] font-mono text-indigo-600 dark:text-indigo-300 flex items-center gap-1.5 shadow-sm">
                      <Activity className="w-3 h-3 text-indigo-500 animate-spin" />
                      <span>{item.text}</span>
                    </div>
                  </motion.div>
                );
              }

              const isAI = item.sender === 'AI';

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: isAI ? -15 : 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}
                >
                  {isAI && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-md">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-[80%] rounded-2xl p-3.5 shadow-sm ${
                    isAI 
                      ? 'bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700/60' 
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-none shadow-indigo-500/20'
                  }`}>
                    <div className="flex items-center justify-between gap-4 mb-1 border-b border-black/5 dark:border-white/10 pb-1 text-[10px] opacity-80">
                      <span className="font-bold uppercase tracking-wider">{item.sender}</span>
                      <span className="font-mono">{item.timestamp}</span>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed">
                      {item.text}
                    </p>
                    {item.confidence && (
                      <div className="mt-1.5 text-[10px] opacity-75 font-mono text-right">
                        Confidence: {(item.confidence * 100).toFixed(1)}%
                      </div>
                    )}
                  </div>

                  {!isAI && (
                    <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 shadow-md">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

      </div>
    </div>
  );
};

export default ConversationPanel;
