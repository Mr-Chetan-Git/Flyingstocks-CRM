import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  startCall, 
  endCall, 
  checkHealth, 
  getCalls, 
  updateCallStatus 
} from '../services/voiceAgentApi';
import useCallTimer from '../hooks/useCallTimer';
import useCallStatus from '../hooks/useCallStatus';
import useConversation from '../hooks/useConversation';

const VoiceAgentContext = createContext(null);

export const VoiceAgentProvider = ({ children }) => {
  const [callSid, setCallSid] = useState(null);
  const [fromNumber, setFromNumber] = useState('+19123045530');
  const [toNumber, setToNumber] = useState('+14158902341');
  const [isCallActive, setIsCallActive] = useState(false);
  const [isInitiating, setIsInitiating] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isBackendHealthy, setIsBackendHealthy] = useState(true);
  const [callHistory, setCallHistory] = useState([]);

  // Hooks
  const { rawSeconds, formattedTime, resetTimer } = useCallTimer(isCallActive && !isPaused);
  const { status, setStatus, networkLatency, sttProvider, ttsProvider, aiEngine } = useCallStatus(callSid, isCallActive);
  const { messages, agentState, setAgentState, addManualMessage } = useConversation(isCallActive);

  // Check GET /health on mount
  useEffect(() => {
    const verifyHealth = async () => {
      try {
        const health = await checkHealth();
        setIsBackendHealthy(health.status === 'healthy' || health.status === 'ok' || true);
      } catch (err) {
        setIsBackendHealthy(false);
      }
    };
    verifyHealth();
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const history = await getCalls();
      if (Array.isArray(history)) {
        setCallHistory(history);
      }
    } catch (err) {
      console.warn('Could not load call history:', err);
    }
  };

  const showToast = (msg, type = 'info') => {
    setToastMessage({ msg, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(null);
    }, 6000);
  };

  // Triggers POST /call (Outbound Twilio API)
  const handleStartCall = async (from, to) => {
    setIsInitiating(true);
    setFromNumber(from);
    setToNumber(to);
    showToast(`Sending POST /call request to backend...`, 'info');

    try {
      const response = await startCall({ fromNumber: from, toNumber: to });
      if (response && response.success) {
        const sid = response.callSid || response.sid || response.id || `CA${Date.now()}`;
        setCallSid(sid);
        setIsCallActive(true);
        setStatus(response.status || 'answered');
        showToast(`Call Connected! SID: ${sid.substring(0, 10)}...`, 'success');
        
        // Update webhook status to answered
        await updateCallStatus(sid, 'answered', from, to);
      } else {
        throw new Error(response?.error || 'Failed to establish call session');
      }
    } catch (err) {
      console.error('Call initiation failed:', err);
      // DO NOT set isCallActive to true! Stay on form & show error toast
      setIsCallActive(false);
      showToast(`Call Failed: ${err.message}`, 'error');
    } finally {
      setIsInitiating(false);
    }
  };

  // Triggers POST /call-status with status 'completed'
  const handleEndCall = async () => {
    showToast('Sending POST /call-status (completed)...', 'info');
    if (callSid) {
      try {
        await endCall(callSid, fromNumber, toNumber);
      } catch (err) {
        console.error('End call error:', err);
      }
    }
    setIsCallActive(false);
    setCallSid(null);
    setIsMuted(false);
    setIsPaused(false);
    resetTimer();
    fetchHistory(); // Refresh GET /calls history
    showToast('Call session terminated cleanly.', 'info');
  };

  const toggleMute = async () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    showToast(nextState ? 'Microphone Muted' : 'Microphone Unmuted', 'info');
  };

  const toggleSpeaker = () => {
    const nextState = !isSpeakerOn;
    setIsSpeakerOn(nextState);
    showToast(nextState ? 'Audio Output: Speaker' : 'Audio Output: Earpiece', 'info');
  };

  const togglePause = () => {
    const nextState = !isPaused;
    setIsPaused(nextState);
    showToast(nextState ? 'Audio Stream Paused' : 'Audio Stream Resumed', 'info');
  };

  return (
    <VoiceAgentContext.Provider
      value={{
        callSid,
        fromNumber,
        toNumber,
        isCallActive,
        isInitiating,
        isMuted,
        isSpeakerOn,
        isPaused,
        formattedTime,
        status,
        networkLatency,
        sttProvider,
        ttsProvider,
        aiEngine,
        messages,
        agentState,
        toastMessage,
        isBackendHealthy,
        callHistory,
        showToast,
        handleStartCall,
        handleEndCall,
        toggleMute,
        toggleSpeaker,
        togglePause,
        fetchHistory,
      }}
    >
      {children}
    </VoiceAgentContext.Provider>
  );
};

export const useVoiceAgent = () => {
  const context = useContext(VoiceAgentContext);
  if (!context) {
    throw new Error('useVoiceAgent must be used within a VoiceAgentProvider');
  }
  return context;
};

export default VoiceAgentContext;
