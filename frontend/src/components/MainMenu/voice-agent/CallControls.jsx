import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Pause, Play, PhoneOff, Forward, Info } from 'lucide-react';
import { useVoiceAgent } from '../../../contexts/VoiceAgentContext';

const CallControls = () => {
  const {
    isMuted,
    isSpeakerOn,
    isPaused,
    toggleMute,
    toggleSpeaker,
    togglePause,
    handleEndCall,
    handleTransfer,
  } = useVoiceAgent();

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferTarget, setTransferTarget] = useState('+1 (800) 555-0199');

  const onTransferSubmit = (e) => {
    e.preventDefault();
    handleTransfer(transferTarget);
    setShowTransferModal(false);
  };

  return (
    <div className="relative">
      
      {/* Control Bar Container */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-center gap-3 sm:gap-6 shadow-xl">
        
        {/* Mute Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleMute}
          className={`flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl transition-all ${
            isMuted
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
              : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
          }`}
          title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          <span className="text-[10px] font-semibold mt-1">{isMuted ? 'Muted' : 'Mute'}</span>
        </motion.button>

        {/* Speaker Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleSpeaker}
          className={`flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl transition-all ${
            !isSpeakerOn
              ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
              : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
          }`}
          title={isSpeakerOn ? 'Speaker On' : 'Speaker Off'}
        >
          {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          <span className="text-[10px] font-semibold mt-1">{isSpeakerOn ? 'Speaker' : 'Earpiece'}</span>
        </motion.button>

        {/* Pause / Resume Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={togglePause}
          className={`flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl transition-all ${
            isPaused
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
          }`}
          title={isPaused ? 'Resume AI Stream' : 'Pause AI Stream'}
        >
          {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
          <span className="text-[10px] font-semibold mt-1">{isPaused ? 'Resume' : 'Pause'}</span>
        </motion.button>

        {/* Transfer Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowTransferModal(true)}
          className="flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all"
          title="Transfer SIP Call"
        >
          <Forward className="w-6 h-6 text-indigo-500" />
          <span className="text-[10px] font-semibold mt-1">Transfer</span>
        </motion.button>

        {/* End Call Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleEndCall}
          className="flex flex-col items-center justify-center w-16 h-14 sm:w-20 sm:h-16 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-500/30 font-bold transition-all ml-2"
          title="End Call Session"
        >
          <PhoneOff className="w-6 h-6" />
          <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">End Call</span>
        </motion.button>

      </div>

      {/* Transfer Call Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Forward className="w-5 h-5 text-indigo-500" /> Transfer Twilio Call Session
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Enter target SIP destination or agent line for warm transfer.
            </p>
            <form onSubmit={onTransferSubmit} className="space-y-4">
              <input
                type="text"
                value={transferTarget}
                onChange={(e) => setTransferTarget(e.target.value)}
                placeholder="+1 (800) 555-0199"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-[11px] text-amber-700 dark:text-amber-300 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Note: Warm transfer requires active SIP trunking configuration on Twilio console.</span>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md"
                >
                  Initiate Transfer
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};

export default CallControls;
