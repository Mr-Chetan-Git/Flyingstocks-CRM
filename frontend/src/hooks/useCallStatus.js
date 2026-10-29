import { useState, useEffect } from 'react';
import { getCallStatus } from '../services/voiceAgentApi';

/**
 * Custom hook to monitor call status and network latency
 */
export const useCallStatus = (callSid, isCallActive) => {
  const [status, setStatus] = useState('idle'); // idle, initiating, connected, ended
  const [networkLatency, setNetworkLatency] = useState('14ms');
  const [sttProvider, setSttProvider] = useState('Deepgram Nova-2');
  const [ttsProvider, setTTSProvider] = useState('ElevenLabs Turbo v2');
  const [aiEngine, setAiEngine] = useState('Gemini 1.5 Flash (Streaming)');

  useEffect(() => {
    let intervalId = null;

    if (isCallActive && callSid) {
      setStatus('connected');

      intervalId = setInterval(async () => {
        try {
          const statusData = await getCallStatus(callSid);
          if (statusData?.networkQuality) {
            setNetworkLatency(statusData.networkQuality);
          }
        } catch (err) {
          console.error('Error fetching call status:', err);
        }
      }, 4000);
    } else if (!isCallActive) {
      setStatus('idle');
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [callSid, isCallActive]);

  return {
    status,
    setStatus,
    networkLatency,
    sttProvider,
    ttsProvider,
    aiEngine,
  };
};

export default useCallStatus;
