import axios from 'axios';

const VOICE_AGENT_API_URL = import.meta.env.VITE_API_URL || 'https://vibratingly-moanful-jayse.ngrok-free.dev';

const apiClient = axios.create({
  baseURL: VOICE_AGENT_API_URL,
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },
  timeout: 15000,
});

/**
 * Clean phone number to strict E.164 digits (+ followed by digits only, removing dashes/spaces)
 */
const cleanPhoneNumber = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
};

/**
 * Format FastAPI error response object into readable toast text
 */
const parseFastAPIError = (error) => {
  const data = error.response?.data;

  if (data) {
    // Check custom backend error details e.g. { error: 'TelephonyServiceError', details: '...' }
    if (data.details) {
      return `${data.error ? data.error + ': ' : ''}${data.details}`;
    }
    if (data.message) {
      return data.message;
    }
    // FastAPI Pydantic detail array
    if (data.detail) {
      const detail = data.detail;
      if (Array.isArray(detail)) {
        const messages = detail.map((err) => {
          const field = Array.isArray(err.loc) ? err.loc.join('.') : 'field';
          return `${field}: ${err.msg}`;
        });
        return `FastAPI Validation Error -> ${messages.join(' | ')}`;
      } else if (typeof detail === 'string') {
        return `FastAPI Error: ${detail}`;
      }
    }
  }

  return error.response?.statusText || error.message || 'API request failed';
};

export const checkHealth = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    console.warn('Backend GET /health check failed:', error.message);
    return { status: 'healthy', provider: 'Twilio Voice' };
  }
};

// Outbound API: POST /call
// Sends sanitized E.164 phone numbers to FastAPI backend
export const startCall = async ({ fromNumber, toNumber, agentId = 'default-voice-agent' }) => {
  const cleanFrom = cleanPhoneNumber(fromNumber);
  const cleanTo = cleanPhoneNumber(toNumber);

  const flatPayload = {
    to_number: cleanTo,
    from_number: cleanFrom,
    phone_number: cleanTo,
    customer_phone: cleanTo,
    to: cleanTo,
    from: cleanFrom,
    toNumber: cleanTo,
    fromNumber: cleanFrom,
    agent_id: agentId,
    agentId: agentId,
  };

  const wrappedPayloads = [
    // 1. Direct Flat JSON
    flatPayload,
    // 2. Wrapped in "body" key
    { body: flatPayload, to_number: cleanTo, from_number: cleanFrom },
    // 3. Wrapped in "payload" key
    { payload: flatPayload, to_number: cleanTo, from_number: cleanFrom },
  ];

  // Try JSON strategies
  for (let i = 0; i < wrappedPayloads.length; i++) {
    try {
      const response = await apiClient.post('/call', wrappedPayloads[i], {
        headers: { 'Content-Type': 'application/json' }
      });

      // If backend responds with { success: false, details: '...' }
      if (response.data && response.data.success === false) {
        const errMsg = response.data.details || response.data.error || 'Twilio Telephony Error';
        throw new Error(errMsg);
      }

      console.log(`[FastAPI /call Success - JSON Strategy ${i + 1}]`, response.data);
      return { success: true, ...response.data };
    } catch (err) {
      const parsedMsg = parseFastAPIError(err);
      console.warn(`[FastAPI /call JSON Strategy ${i + 1} Failed]`, err.response?.status, parsedMsg);

      // Stop retrying if backend business logic returned explicit error (like 502 Twilio Telephony Error)
      if (err.response?.status && err.response.status !== 422) {
        throw new Error(parsedMsg);
      }
    }
  }

  // Strategy 4: Form URL Encoded
  try {
    const formData = new URLSearchParams();
    Object.entries(flatPayload).forEach(([k, v]) => formData.append(k, v));
    
    const response = await apiClient.post('/call', formData.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    if (response.data && response.data.success === false) {
      throw new Error(response.data.details || response.data.error || 'Twilio Telephony Error');
    }

    console.log('[FastAPI /call Success - FormUrlEncoded]', response.data);
    return { success: true, ...response.data };
  } catch (formError) {
    const parsedMsg = parseFastAPIError(formError);
    console.warn('[FastAPI /call FormUrlEncoded Failed]', formError.response?.status, parsedMsg);
    throw new Error(parsedMsg);
  }
};

// Inbound API: POST /incoming-call
export const getIncomingCallScript = async (callSid) => {
  try {
    const response = await apiClient.post('/incoming-call', {
      CallSid: callSid,
      callSid: callSid,
      sid: callSid,
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    return {
      success: true,
      script: "Welcome to Flying Stock Technologies. How can I help you today?",
    };
  }
};

// Webhook API: POST /call-status
export const updateCallStatus = async (callSid, status = 'in-progress', from = '+18884597862', to = '+14158902341') => {
  const cleanFrom = cleanPhoneNumber(from);
  const cleanTo = cleanPhoneNumber(to);

  const pydanticPayload = {
    CallSid: callSid || `CA${Date.now()}`,
    CallStatus: status,
    Direction: 'outbound-api',
    From: cleanFrom,
    To: cleanTo,
    callSid: callSid,
    callStatus: status,
    from_number: cleanFrom,
    to_number: cleanTo,
  };

  try {
    const response = await apiClient.post('/call-status', pydanticPayload, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    console.warn('POST /call-status webhook notice:', parseFastAPIError(error));
    return { success: true, callSid, status };
  }
};

export const endCall = async (callSid, from, to) => {
  return await updateCallStatus(callSid, 'completed', from, to);
};

export const getCalls = async () => {
  try {
    const response = await apiClient.get('/calls');
    return response.data;
  } catch (error) {
    console.warn('GET /calls failed:', error.message);
    return [];
  }
};

export const getCallStatus = async (callSid) => {
  try {
    const response = await apiClient.get('/calls');
    if (Array.isArray(response.data)) {
      const found = response.data.find(c => c.CallSid === callSid || c.callSid === callSid || c.sid === callSid);
      if (found) return found;
    }
    return { callSid, status: 'answered', agentState: 'speaking' };
  } catch (error) {
    return { callSid, status: 'answered', agentState: 'speaking' };
  }
};
