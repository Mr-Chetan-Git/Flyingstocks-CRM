import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mic, Sparkles, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { VoiceAgentProvider, useVoiceAgent } from '../contexts/VoiceAgentContext';
import CallConfigurationForm from '../components/MainMenu/voice-agent/CallConfigurationForm';
import VoiceDashboard from '../components/MainMenu/voice-agent/VoiceDashboard';
import CallHistoryTable from '../components/MainMenu/voice-agent/CallHistoryTable';
import Button from '../components/MainMenu/Button';

const ToastNotification = () => {
  const { toastMessage } = useVoiceAgent();

  if (!toastMessage) return null;

  const getIcon = () => {
    switch (toastMessage.type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Info className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="fixed top-24 right-6 z-50 pointer-events-none">
      <AnimatePresence>
        <motion.div
          key={toastMessage.id}
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="glass-card px-4 py-3 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-slate-900/90 text-white backdrop-blur-xl"
        >
          {getIcon()}
          <span>{toastMessage.msg}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const VoiceAgentPageContent = () => {
  const navigate = useNavigate();
  const { isCallActive } = useVoiceAgent();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative">
      
      {/* Toast Notification Container */}
      <ToastNotification />

      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/main-menu')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Suite
          </Button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                AI Voice Agents <span className="gradient-text">Console</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Enterprise Twilio Voice Gateway & Conversational Telemetry
              </p>
            </div>
          </div>
        </div>

        {/* Live System Operational Status */}
        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Twilio Voice Engine: <strong className="text-slate-900 dark:text-white">Active</strong></span>
        </div>
      </div>

      {/* Main View Transition */}
      <AnimatePresence mode="wait">
        {!isCallActive ? (
          <motion.div key="config-form" exit={{ opacity: 0, y: -10 }}>
            <CallConfigurationForm />
            <CallHistoryTable />
          </motion.div>
        ) : (
          <motion.div key="dashboard" exit={{ opacity: 0, y: 10 }}>
            <VoiceDashboard />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

const VoiceAgentPage = () => {
  return (
    <VoiceAgentProvider>
      <VoiceAgentPageContent />
    </VoiceAgentProvider>
  );
};

export default VoiceAgentPage;
