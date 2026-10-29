import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PhoneCall, ShieldCheck, Sparkles, AlertCircle, ArrowRight, Zap, CheckCircle2, User, Phone } from 'lucide-react';
import Button from '../Button';
import { useVoiceAgent } from '../../../contexts/VoiceAgentContext';

// Basic E.164 phone number validator: must start with +, followed by 10 to 15 digits
const validateE164 = (phone) => {
  if (!phone) return false;
  // Clean spaces, dashes, parentheses for checking
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  return /^\+[1-9]\d{9,14}$/.test(cleaned);
};

const CallConfigurationForm = () => {
  const { handleStartCall, isInitiating } = useVoiceAgent();

  const [fromNumber, setFromNumber] = useState('+19123045530');
  const [toNumber, setToNumber] = useState('+14158902341');

  const isFromValid = validateE164(fromNumber);
  const isToValid = validateE164(toNumber);
  const isValid = isFromValid && isToValid;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValid && !isInitiating) {
      handleStartCall(fromNumber, toNumber);
    }
  };

  const presetDemos = [
    { label: 'Enterprise Sales Hotline', from: '+19123045530', to: '+14158902341' },
    { label: '24/7 VIP Customer Support', from: '+19123045530', to: '+12125550199' },
    { label: 'Algo Trading Desk Alert', from: '+19123045530', to: '+13125550188' },
  ];

  const applyPreset = (preset) => {
    setFromNumber(preset.from);
    setToNumber(preset.to);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto py-8"
    >
      <div className="glass-card rounded-3xl p-8 md:p-10 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl relative overflow-hidden">
        
        {/* Glow Accent */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <PhoneCall className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Start AI Voice Session
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Twilio SIP Ready
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Configure E.164 phone numbers to launch a real-time conversational AI call session.
            </p>
          </div>
        </div>

        {/* Quick Demo Presets */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Quick Investor Demo Presets
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {presetDemos.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(preset)}
                className="px-3 py-2 rounded-xl text-xs font-medium bg-slate-100/80 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-left transition-all flex items-center justify-between group"
              >
                <span className="truncate">{preset.label}</span>
                <Zap className="w-3.5 h-3.5 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Configuration Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* From Number Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-indigo-500" />
                From Number (Your Purchased / Verified Twilio Number)
              </span>
              <span className="text-xs font-mono text-slate-400">Format: E.164 (+1...)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={fromNumber}
                onChange={(e) => setFromNumber(e.target.value)}
                placeholder="+18884597862 (Your Twilio Number)"
                className={`w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-sm font-mono focus:outline-none focus:ring-2 transition-all ${
                  isFromValid
                    ? 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500'
                    : 'border-red-300 dark:border-red-900 focus:ring-red-500'
                }`}
              />
              <div className="absolute right-3.5 top-3.5">
                {isFromValid ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                )}
              </div>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              💡 Must be a phone number purchased or verified inside your <a href="https://console.twilio.com/" target="_blank" rel="noreferrer" className="text-indigo-500 underline font-semibold">Twilio Console</a>.
            </p>
          </div>

          {/* To Number Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4 text-purple-500" />
                To Number (Destination Prospect)
              </span>
              <span className="text-xs font-mono text-slate-400">Format: E.164 (+1...)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={toNumber}
                onChange={(e) => setToNumber(e.target.value)}
                placeholder="+1 (415) 890-2341"
                className={`w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-sm font-mono focus:outline-none focus:ring-2 transition-all ${
                  isToValid
                    ? 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500'
                    : 'border-red-300 dark:border-red-900 focus:ring-red-500'
                }`}
              />
              <div className="absolute right-3.5 top-3.5">
                {isToValid ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                )}
              </div>
            </div>
            {!isToValid && toNumber.length > 0 && (
              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Please enter a valid E.164 phone number starting with + (e.g. +14158902341).
              </p>
            )}
          </div>

          {/* Call Specifications Overview */}
          <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-800/50 space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
                Engine Specs:
              </span>
              <span>Gemini 1.5 Flash + Twilio Media Stream</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Speech-to-Text: Deepgram Nova-2 (12ms)</span>
              <span>Text-to-Speech: ElevenLabs Turbo v2</span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={!isValid || isInitiating}
            className="w-full py-4 text-base font-bold shadow-xl shadow-indigo-500/25"
            icon={ArrowRight}
          >
            {isInitiating ? 'Connecting to Twilio Voice Gateway...' : 'Start AI Call'}
          </Button>

        </form>

      </div>
    </motion.div>
  );
};

export default CallConfigurationForm;
