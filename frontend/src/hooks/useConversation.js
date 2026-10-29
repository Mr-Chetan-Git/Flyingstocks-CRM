import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to maintain real-time conversation timeline and agent state
 */
export const useConversation = (isCallActive) => {
  const [messages, setMessages] = useState([]);
  const [agentState, setAgentState] = useState('idle'); // 'listening' | 'thinking' | 'speaking' | 'idle'
  const simulationTimerRef = useRef(null);

  // Script sequence for realistic demo flow when call connects
  const demoScript = [
    {
      delay: 1000,
      state: 'speaking',
      message: {
        id: 'msg-1',
        sender: 'AI',
        text: 'Hello! Thank you for calling Flying Stock Technologies. My name is Alex, your AI voice assistant. How can I empower your team today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        confidence: 0.99,
      },
    },
    {
      delay: 4000,
      state: 'listening',
      systemEvent: 'Listening for customer speech input...',
    },
    {
      delay: 7000,
      state: 'thinking',
      systemEvent: 'Speech recognized: "I would like to inquire about automated stock sentiment signals."',
      message: {
        id: 'msg-2',
        sender: 'Customer',
        text: 'Hi Alex, I would like to inquire about your automated stock sentiment signals and trading integration.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      },
    },
    {
      delay: 10000,
      state: 'speaking',
      message: {
        id: 'msg-3',
        sender: 'AI',
        text: 'Great choice! Our AI Algo Trading product executes sub-millisecond sentiment analysis using neural transformers across tick-by-tick data feeds.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        confidence: 0.98,
      },
    },
    {
      delay: 15000,
      state: 'listening',
      systemEvent: 'Listening for customer input...',
    },
    {
      delay: 18000,
      state: 'thinking',
      systemEvent: 'Intent recognized: SCHEDULE_DEMO (Confidence: 96.4%)',
      message: {
        id: 'msg-4',
        sender: 'Customer',
        text: 'That sounds impressive. Can we schedule a live demonstration with an enterprise specialist?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      },
    },
    {
      delay: 21000,
      state: 'speaking',
      message: {
        id: 'msg-5',
        sender: 'AI',
        text: 'Certainly! I have reserved a priority demo slot for your account. A confirmation email and calendar invite have been dispatched.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        confidence: 0.99,
      },
    },
    {
      delay: 26000,
      state: 'listening',
      systemEvent: 'Stream open - standing by for voice commands...',
    }
  ];

  useEffect(() => {
    if (isCallActive) {
      setMessages([]);
      setAgentState('speaking');

      // Schedule demo script steps
      const timeouts = demoScript.map((step) => {
        return setTimeout(() => {
          setAgentState(step.state);

          if (step.systemEvent) {
            setMessages((prev) => [
              ...prev,
              {
                id: `sys-${Date.now()}-${Math.random()}`,
                sender: 'System',
                text: step.systemEvent,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              },
            ]);
          }

          if (step.message) {
            setMessages((prev) => [...prev, step.message]);
          }
        }, step.delay);
      });

      return () => {
        timeouts.forEach((t) => clearTimeout(t));
      };
    } else {
      setMessages([]);
      setAgentState('idle');
    }
  }, [isCallActive]);

  const addManualMessage = (sender, text) => {
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  return {
    messages,
    agentState,
    setAgentState,
    addManualMessage,
  };
};

export default useConversation;
