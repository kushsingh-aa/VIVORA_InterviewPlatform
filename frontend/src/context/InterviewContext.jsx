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
  const [finalReport, setFinalReportState] = useState(() => {
    try {
      const saved = localStorage.getItem('vivora_last_report');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const setFinalReport = useCallback((rep) => {
    setFinalReportState(rep);
    if (rep && (rep.overallScore > 0 || rep.roleTitle)) {
      try {
        localStorage.setItem('vivora_last_report', JSON.stringify(rep));
      } catch {}
    }
  }, []);

  const [historyArchive, setHistoryArchive] = useState([]);

  // Dynamic Live Metrics evaluated from candidate answers
  const [liveEvaluation, setLiveEvaluation] = useState({
    clarityScore: 92,
    technicalDepth: 88,
    problemSolving: 85,
    wpm: 138,
    accuracyStatus: 'Ready for Input',
    latestHighlights: ['Awaiting response formulation'],
    latestCritiques: []
  });

  const lastStartTimeRef = useRef(Date.now());
  const telemetryIntervalRef = useRef(null);

  const { speak, cancel: cancelSpeech, isSpeaking, voiceEnabled, toggleVoice, speechRate, setSpeechRate } = useSpeechSynthesis();

  // Send telemetry to backend for behavior analysis
  const sendTelemetryToBackend = useCallback(async (telemetryData) => {
    if (!activeSession?.sessionId) return;
    try {
      await api.post('/interview/telemetry', {
        sessionId: activeSession.sessionId,
        telemetryData
      });
    } catch {}
  }, [activeSession?.sessionId]);

  // Load past history sessions
  const loadHistory = useCallback(async () => {
    try {
      const res = await api.get('/interview/history');
      if (res.data?.history) {
        setHistoryArchive(res.data.history);
        setFinalReportState(prev => {
          if (prev && prev.overallScore > 0) return prev;
          const latest = res.data.history.find(h => h.report && h.report.overallScore > 0) || res.data.history[0];
          if (latest?.report) {
            try { localStorage.setItem('vivora_last_report', JSON.stringify(latest.report)); } catch {}
            return latest.report;
          }
          return prev;
        });
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
    setActiveSession(null);
    setHistory([]);
    setFinalReport(null);
    setIsAiThinking(true);
    setAiStatus('Initializing...');
    lastStartTimeRef.current = Date.now();

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
        totalQuestions: data.totalQuestions || 6,
        questionIndex: 1,
        status: 'active'
      });

      setLiveEvaluation({
        clarityScore: 90,
        technicalDepth: 88,
        problemSolving: 85,
        wpm: 135,
        accuracyStatus: 'Question 1 In Progress',
        latestHighlights: ['Scenario initialized'],
        latestCritiques: []
      });

      setHistory(initialHistory);
      setIsAiThinking(false);
      setAiStatus('Ready');
      lastStartTimeRef.current = Date.now();

      // Speak opening question
      if (initialHistory.length > 0) {
        speak(initialHistory[0].text);
      }

      // Start periodic telemetry sync to backend
      if (telemetryIntervalRef.current) clearInterval(telemetryIntervalRef.current);

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

    // Calculate real WPM
    const elapsedSeconds = Math.max(3, (Date.now() - lastStartTimeRef.current) / 1000);
    const wordCount = answerText.trim().split(/\s+/).length;
    let computedWpm = Math.round((wordCount / (elapsedSeconds / 60)));
    // Clamp to realistic speech/articulation bounds (110 - 175)
    computedWpm = Math.max(115, Math.min(170, computedWpm || 140));

    // Optimistically push candidate answer to chat stream
    const candidateEntry = {
      speaker: 'candidate',
      text: answerText,
      wpm: computedWpm,
      clarityScore: null, // will be populated by AI evaluation
      accuracyLabel: 'Analyzing...',
      timestamp: new Date().toISOString()
    };

    setHistory(prev => [...prev, candidateEntry]);
    setIsAiThinking(true);
    setAiStatus('Evaluating Answer...');

    try {
      const res = await api.post('/interview/message', {
        sessionId: activeSession.sessionId,
        answerText
      });

      const data = res.data;
      setIsAiThinking(false);

      // Compute dynamic clarity & accuracy status based on real LLM evaluation
      const evalData = data.evaluation || {};
      const isOffTopic = evalData.isOffTopic === true || evalData.overallScore === 0 || data.isOffTopic === true;
      const clarity = isOffTopic ? null : (evalData.communication || evalData.overallScore || 0);
      const techDepth = isOffTopic ? 0 : (evalData.technicalDepth || 0);
      const probSolving = isOffTopic ? 0 : (evalData.problemSolving || 0);
      const overall = isOffTopic ? 0 : (evalData.overallScore || 0);

      let accuracyLabel = null;
      if (isOffTopic) {
        accuracyLabel = '⚠️ Off-Topic Response';
      } else if (overall >= 90) {
        accuracyLabel = `🎯 Highly Crisp & Optimal (${overall}%)`;
      } else if (overall >= 80) {
        accuracyLabel = `💡 Solid Conceptual Match (${overall}%)`;
      } else if (overall >= 70) {
        accuracyLabel = `⚡ Good Reasoning (${overall}%)`;
      } else {
        accuracyLabel = `⚠️ Needs Concrete Specifics (${overall}%)`;
      }

      // Update live telemetry HUD state with REAL LLM scores
      setLiveEvaluation({
        isOffTopic,
        clarityScore: isOffTopic ? null : clarity,
        technicalDepth: techDepth,
        problemSolving: probSolving,
        wpm: computedWpm,
        accuracyStatus: isOffTopic ? '⚠️ Off-Topic / Awaiting Technical Answer' : accuracyLabel,
        latestHighlights: isOffTopic ? ['No technical concepts detected'] : (evalData.highlights?.length > 0 ? evalData.highlights : ['Systematic reasoning']),
        latestCritiques: evalData.critiques || []
      });

      if (data.isComplete) {
        cancelSpeech();
        if (telemetryIntervalRef.current) clearInterval(telemetryIntervalRef.current);
        setActiveSession(null);
        setHistory([]);
        setFinalReport(data.report);
        loadHistory();
        return { isComplete: true, report: data.report };
      }

      const interviewerEntry = {
        speaker: 'interviewer',
        text: data.interviewerText,
        isFollowUp: data.isFollowUp,
        isOffTopic: isOffTopic,
        evaluation: evalData,
        timestamp: new Date().toISOString()
      };

      // Update candidate message in history with real evaluation tag
      setHistory(prev => {
        const next = [...prev];
        // find candidate's last message
        for (let i = next.length - 1; i >= 0; i--) {
          if (next[i].speaker === 'candidate') {
            next[i] = {
              ...next[i],
              isOffTopic,
              clarityScore: isOffTopic ? null : clarity,
              accuracyLabel: accuracyLabel,
              evaluation: evalData
            };
            break;
          }
        }
        return [...next, interviewerEntry];
      });

      setActiveSession(prev => ({
        ...prev,
        questionIndex: (data.currentQuestionIndex || prev.questionIndex)
      }));

      setAiStatus('Ready');
      lastStartTimeRef.current = Date.now();
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

  // End session - stop telemetry sync
  useEffect(() => {
    return () => {
      if (telemetryIntervalRef.current) clearInterval(telemetryIntervalRef.current);
    }
  }, []);

  // Expose telemetry sending for TelemetryHUD
  const reportTelemetry = useCallback((data) => {
    sendTelemetryToBackend(data);
  }, [sendTelemetryToBackend]);

  // Reset active session and conversation history completely for a fresh assessment
  const resetSession = useCallback(() => {
    cancelSpeech();
    if (telemetryIntervalRef.current) clearInterval(telemetryIntervalRef.current);
    setActiveSession(null);
    setHistory([]);
    setIsAiThinking(false);
    setAiStatus('Ready');
    setLiveEvaluation({
      clarityScore: null,
      technicalDepth: 0,
      problemSolving: 0,
      wpm: 0,
      accuracyStatus: 'Ready for Assessment',
      latestHighlights: [],
      latestCritiques: []
    });
  }, [cancelSpeech]);

  // End chamber immediately
  const endSession = async () => {
    cancelSpeech();
    if (telemetryIntervalRef.current) clearInterval(telemetryIntervalRef.current);

    if (activeSession) {
      const sessId = activeSession.sessionId;
      setActiveSession(null); // Clear active session immediately so chamber closes
      setHistory([]);

      try {
        const res = await api.post('/interview/complete', { sessionId: sessId });
        const report = res.data?.report || {
          overallScore: 0,
          recommendation: 'Incomplete / Concluded Early',
          executiveSummary: 'Assessment chamber was concluded early.'
        };
        setFinalReport(report);
        loadHistory();
        return report;
      } catch (err) {
        const fallbackReport = {
          overallScore: 0,
          recommendation: 'Incomplete / Concluded Early',
          executiveSummary: 'Assessment chamber was concluded early.'
        };
        setFinalReport(fallbackReport);
        loadHistory();
        return fallbackReport;
      }
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
      liveEvaluation,
      isSpeaking,
      voiceEnabled,
      toggleVoice,
      speechRate,
      setSpeechRate,
      cancelSpeech,
      startSession,
      resetSession,
      submitAnswer,
      requestHint,
      sendCopilotMessage,
      endSession,
      repeatVoice,
      loadHistory,
      reportTelemetry
    }}>
      {children}
    </InterviewContext.Provider>
  );
}

export function useInterview() {
  return useContext(InterviewContext);
}
