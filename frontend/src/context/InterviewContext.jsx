import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

const InterviewContext = createContext();

export const SENIORITY_INFO = {
  'Junior': {
    title: 'Junior Level (0-2 YOE):',
    desc: 'Core language fundamentals, clean CRUD APIs, input validation, basic SQL joins & indexing, and structured problem breakdown.'
  },
  'Mid-Level': {
    title: 'Mid-Level (3-5 YOE):',
    desc: 'Production microservice design, query optimization, caching layers (Redis), background worker queues, and defensive programming.'
  },
  'Senior': {
    title: 'Senior Level (5-8 YOE):',
    desc: 'Distributed systems scalability, concurrency locking, cache stampedes, fault isolation, and latency tradeoffs.'
  },
  'Staff/Lead': {
    title: 'Staff / Principal Level (8+ YOE):',
    desc: 'Planetary multi-region active-active architectures, zero-downtime database sharding, consensus protocols, and macro technical strategy.'
  }
};

export function InterviewProvider({ children }) {
  const [selectedDifficulty, setSelectedDifficulty] = useState('Senior');
  const [activeSession, setActiveSession] = useState(null);
  const [history, setHistory] = useState([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiStatus, setAiStatus] = useState('Ready');
  const [copilotMessages, setCopilotMessages] = useState([
    {
      sender: 'copilot',
      text: '🤖 **Vivora Copilot Online:** I can provide structural frameworks (STAR, Tradeoff Matrix), hints, or technical advice during your interview.'
    }
  ]);
  const [finalReport, setFinalReport] = useState(null);
  const [historyArchive, setHistoryArchive] = useState([]);

  const { speak, cancel: cancelSpeech, isSpeaking, voiceEnabled, toggleVoice, speechRate, setSpeechRate } = useSpeechSynthesis();

  // Load past history sessions
  const loadHistory = useCallback(async () => {
    try {
      const res = await api.get('/interview/history');
      if (res.data?.history) {
        setHistoryArchive(res.data.history);
      }
    } catch (err) {
      console.warn('Could not load history archive:', err.message);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Start new interview session
  const startSession = async (track) => {
    cancelSpeech();
    setFinalReport(null);
    setIsAiThinking(true);
    setAiStatus('Initializing...');

    try {
      const res = await api.post('/interview/start', {
        track,
        difficulty: selectedDifficulty,
        role: track === 'software' ? 'Software Engineering Core' :
              track === 'system_design' ? 'System Design & Architecture' :
              track === 'product' ? 'Product Management Lead' : 'Behavioral & Leadership'
      });

      const data = res.data;
      const initialHistory = data.history || [];

      setActiveSession({
        sessionId: data.sessionId,
        track: data.track,
        difficulty: selectedDifficulty,
        persona: data.persona,
        roleTitle: data.roleTitle,
        currentQuestion: data.currentQuestion,
        totalQuestions: data.totalQuestions || 4,
        questionIndex: 1,
        status: 'active'
      });

      setHistory(initialHistory);
      setIsAiThinking(false);
      setAiStatus('Ready');

      // Speak opening question
      if (initialHistory.length > 0) {
        speak(initialHistory[0].text);
      }

      return { success: true };
    } catch (err) {
      setIsAiThinking(false);
      setAiStatus('Ready');
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to initialize session'
      };
    }
  };

  // Submit candidate answer
  const submitAnswer = async (answerText) => {
    if (!activeSession || !answerText.trim()) return;

    cancelSpeech();

    // Optimistically push candidate answer to chat stream
    const candidateEntry = {
      speaker: 'candidate',
      text: answerText,
      timestamp: new Date().toISOString()
    };

    setHistory(prev => [...prev, candidateEntry]);
    setIsAiThinking(true);
    setAiStatus('Evaluating...');

    try {
      const res = await api.post('/interview/message', {
        sessionId: activeSession.sessionId,
        answerText
      });

      const data = res.data;
      setIsAiThinking(false);

      if (data.isComplete) {
        cancelSpeech();
        setActiveSession(prev => ({ ...prev, status: 'completed' }));
        setFinalReport(data.report);
        loadHistory();
        return { isComplete: true, report: data.report };
      }

      const interviewerEntry = {
        speaker: 'interviewer',
        text: data.interviewerText,
        isFollowUp: data.isFollowUp,
        evaluation: data.evaluation,
        timestamp: new Date().toISOString()
      };

      setHistory(prev => [...prev, interviewerEntry]);
      setActiveSession(prev => ({
        ...prev,
        questionIndex: (data.currentQuestionIndex || prev.questionIndex)
      }));

      setAiStatus('Ready');
      speak(data.interviewerText);

      return { isComplete: false };
    } catch (err) {
      setIsAiThinking(false);
      setAiStatus('Ready');
      return { isComplete: false, error: err.message };
    }
  };

  // Request targeted hint
  const requestHint = async () => {
    if (!activeSession) return null;
    try {
      const res = await api.post('/interview/hint', { sessionId: activeSession.sessionId });
      return res.data?.hint || null;
    } catch (err) {
      return 'Structure your answer by identifying the core bottleneck, immediate mitigation steps, and long-term architectural trade-offs.';
    }
  };

  // Chat with in-session Copilot
  const sendCopilotMessage = async (query) => {
    if (!query.trim()) return;

    setCopilotMessages(prev => [...prev, { sender: 'user', text: query }]);

    try {
      const res = await api.post('/interview/assistant', {
        sessionId: activeSession?.sessionId,
        query
      });
      setCopilotMessages(prev => [
        ...prev,
        { sender: 'copilot', text: res.data?.reply || 'Focus on breaking down your problem systematically.' }
      ]);
    } catch (err) {
      setCopilotMessages(prev => [
        ...prev,
        { sender: 'copilot', text: '🤖 **Copilot:** Structure your answer with clear problem statements and quantifiable results.' }
      ]);
    }
  };

  // End chamber immediately
  const endSession = async () => {
    cancelSpeech();

    if (activeSession) {
      setActiveSession(prev => ({ ...prev, status: 'completed' }));
      try {
        const res = await api.post('/interview/complete', { sessionId: activeSession.sessionId });
        if (res.data?.report) {
          setFinalReport(res.data.report);
          loadHistory();
          return res.data.report;
        }
      } catch (err) {}
    }
    return null;
  };

  // Repeat audio of current question
  const repeatVoice = () => {
    const lastMsg = [...history].reverse().find(h => h.speaker === 'interviewer');
    if (lastMsg) {
      speak(lastMsg.text);
    }
  };

  return (
    <InterviewContext.Provider value={{
      selectedDifficulty,
      setSelectedDifficulty,
      activeSession,
      history,
      isAiThinking,
      aiStatus,
      finalReport,
      setFinalReport,
      copilotMessages,
      historyArchive,
      isSpeaking,
      voiceEnabled,
      toggleVoice,
      speechRate,
      setSpeechRate,
      cancelSpeech,
      startSession,
      submitAnswer,
      requestHint,
      sendCopilotMessage,
      endSession,
      repeatVoice,
      loadHistory
    }}>
      {children}
    </InterviewContext.Provider>
  );
}

export function useInterview() {
  return useContext(InterviewContext);
}
