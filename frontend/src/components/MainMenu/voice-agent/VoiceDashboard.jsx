import React from 'react';
import { motion } from 'framer-motion';
import StatusCards from './StatusCards';
import AgentAvatar from './AgentAvatar';
import VoiceWave from './VoiceWave';
import ConversationPanel from './ConversationPanel';
import CallInfoSidebar from './CallInfoSidebar';
import CallControls from './CallControls';
import { useVoiceAgent } from '../../../contexts/VoiceAgentContext';

const VoiceDashboard = () => {
  const {
    callSid,
    formattedTime,
    isPaused,
    networkLatency,
    sttProvider,
    ttsProvider,
    aiEngine,
    agentState,
  } = useVoiceAgent();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Top Status Cards */}
      <StatusCards
        callSid={callSid}
        formattedTime={formattedTime}
        isPaused={isPaused}
        networkLatency={networkLatency}
        sttProvider={sttProvider}
        ttsProvider={ttsProvider}
        aiEngine={aiEngine}
      />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Agent Voice Center + Live Transcript Panel */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Agent Voice Visualization Card */}
          <div className="glass-card rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-xl flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-indigo-500/5 to-transparent">
            
            {/* Agent Avatar */}
            <AgentAvatar state={agentState} agentName="Alex - Flying Stock AI" />

            {/* Voice Waveform */}
            <div className="w-full max-w-md mt-6">
              <VoiceWave state={agentState} />
            </div>

            {/* Helper status string */}
            <p className="text-xs font-mono text-slate-500 mt-2">
              {agentState === 'listening' && 'Receptive Speech Buffer: Open'}
              {agentState === 'thinking' && 'Neural Transformer Processing...'}
              {agentState === 'speaking' && 'Streaming ElevenLabs TTS Synthesizer'}
              {agentState === 'idle' && 'Standby mode'}
            </p>
          </div>

          {/* Conversation Panel */}
          <ConversationPanel />

        </div>

        {/* Right 1 Column: Call Info Sidebar */}
        <div className="lg:col-span-1">
          <CallInfoSidebar />
        </div>

      </div>

      {/* Bottom Sticky Control Bar */}
      <div className="sticky bottom-6 z-40">
        <CallControls />
      </div>

    </motion.div>
  );
};

export default VoiceDashboard;
