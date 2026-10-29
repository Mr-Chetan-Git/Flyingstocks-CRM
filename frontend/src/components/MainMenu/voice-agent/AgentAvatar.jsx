import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Mic, Brain, Volume2 } from 'lucide-react';

const AgentAvatar = ({ state = 'idle', agentName = 'Alex AI' }) => {
  
  const getBadgeInfo = () => {
    switch (state) {
      case 'listening':
        return { label: 'Listening...', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30', icon: Mic };
      case 'thinking':
        return { label: 'Thinking...', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30', icon: Brain };
      case 'speaking':
        return { label: 'Speaking...', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30', icon: Volume2 };
      default:
        return { label: 'Standby', color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30', icon: Bot };
    }
  };

  const getRingColor = () => {
    switch (state) {
      case 'listening':
        return 'from-blue-500 via-indigo-500 to-cyan-500';
      case 'thinking':
        return 'from-purple-500 via-pink-500 to-indigo-500';
      case 'speaking':
        return 'from-emerald-400 via-indigo-500 to-purple-500';
      default:
        return 'from-slate-400 to-slate-600';
    }
  };

  const badge = getBadgeInfo();
  const BadgeIcon = badge.icon;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        
        {/* Animated Pulse Ring */}
        <motion.div
          animate={
            state !== 'idle'
              ? {
                  scale: [1, 1.25, 1],
                  opacity: [0.3, 0.7, 0.3],
                }
              : { scale: 1, opacity: 0.2 }
          }
          transition={{
            duration: state === 'speaking' ? 1.5 : 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`absolute -inset-3 rounded-full bg-gradient-to-tr ${getRingColor()} blur-md pointer-events-none`}
        />

        {/* Avatar Circle */}
        <div className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-900 border-2 border-indigo-500/40 p-1 flex items-center justify-center shadow-2xl overflow-hidden`}>
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 flex items-center justify-center text-indigo-400 relative">
            <Bot className="w-12 h-12 text-indigo-400" />
            
            {/* Online Status Dot */}
            <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-md"></span>
          </div>
        </div>

      </div>

      {/* Agent Name */}
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-4 flex items-center gap-2">
        {agentName}
      </h3>

      {/* State Pill */}
      <motion.div 
        key={state}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.color}`}
      >
        <BadgeIcon className="w-3.5 h-3.5 animate-pulse" />
        <span>{badge.label}</span>
      </motion.div>
    </div>
  );
};

export default AgentAvatar;
