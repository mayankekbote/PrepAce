import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, Button } from "../components/UI";
import { interviewApi } from "../services/interviewApi";
import useSpeechRecognition from "../hooks/useSpeechRecognition";
import useSpeechSynthesis from "../hooks/useSpeechSynthesis";

import InterviewProgress from "../components/interview/InterviewProgress";
import InterviewQuestionCard from "../components/interview/InterviewQuestionCard";
import VoiceAnswerPanel from "../components/interview/VoiceAnswerPanel";
import TranscriptEditor from "../components/interview/TranscriptEditor";

import { Loader2, AlertTriangle, CheckCircle2, Home, RotateCcw } from "lucide-react";

export const InterviewRoomPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Input Mode: "SPEECH" or "TEXT"
  const [inputMode, setInputMode] = useState("SPEECH");

  // End Session Confirmation Modal state
  const [showEndModal, setShowEndModal] = useState(false);

  // Speech Recognition Hook
  const {
    isSupported: sttSupported,
    isListening,
    transcript,
    setTranscript,
    confidenceScore,
    error: sttError,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  // Speech Synthesis Hook
  const { isSpeaking, speak, cancel: cancelTts, replay } = useSpeechSynthesis();

  // Active question ref to avoid duplicate TTS triggers
  const activeQuestionIdRef = useRef(null);

  // Fetch / Restore Session State
  const fetchSessionState = useCallback(async () => {
    if (!sessionId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await interviewApi.getInterviewState(sessionId);
      if (res.success && res.data) {
        setSession(res.data);
      } else {
        setError(res.message || "Failed to load interview state.");
      }
    } catch (err) {
      console.error("Fetch Session Error:", err);
      const status = err.response?.status;
      if (status === 404) {
        setError("Interview session not found or access denied.");
      } else {
        setError("Connection error: Unable to load interview session.");
      }
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchSessionState();
  }, [fetchSessionState]);

  // Handle TTS playback when current question changes
  useEffect(() => {
    const sessionMeta = session?.session || session;
    if (session && session.currentQuestion && sessionMeta?.status === "IN_PROGRESS") {
      const qId = session.currentQuestion.id || `${session.currentQuestion.sequence}_${session.currentQuestion.questionText}`;
      
      if (activeQuestionIdRef.current !== qId) {
        activeQuestionIdRef.current = qId;
        resetTranscript();
        
        // Speak new question text aloud
        speak(session.currentQuestion.questionText);
      }
    }
  }, [session, speak, resetTranscript]);

  // Handle Start Listening
  const handleStartListening = () => {
    if (isSpeaking) {
      cancelTts();
    }
    startListening();
  };

  // Toggle Input Mode (SPEECH <-> TEXT)
  const handleToggleInputMode = () => {
    if (isListening) {
      stopListening();
    }
    setInputMode((prev) => (prev === "SPEECH" ? "TEXT" : "SPEECH"));
  };

  // Submit Candidate Answer
  const handleSubmitAnswer = async () => {
    if (submitting || !transcript || transcript.trim().length === 0) return;

    if (isListening) {
      stopListening();
    }
    cancelTts();

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        answerText: transcript.trim(),
        inputMode: inputMode,
        confidenceScore: confidenceScore,
        audioUrl: null,
      };

      const res = await interviewApi.submitAnswer(sessionId, payload);

      if (res.success && res.data) {
        setSession(res.data);
        resetTranscript();
      } else {
        setError(res.message || "Failed to submit answer.");
      }
    } catch (err) {
      console.error("Submit Answer Error:", err);
      const msg = err.response?.data?.message || err.message || "Network error while submitting answer.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Skip / "I Don't Know" Handling
  const handleSkipQuestion = async () => {
    if (submitting) return;

    if (isListening) {
      stopListening();
    }
    cancelTts();

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        answerText: "I don't know",
        inputMode: inputMode,
        confidenceScore: null,
        audioUrl: null,
      };

      const res = await interviewApi.submitAnswer(sessionId, payload);

      if (res.success && res.data) {
        setSession(res.data);
        resetTranscript();
      } else {
        setError(res.message || "Failed to skip question.");
      }
    } catch (err) {
      console.error("Skip Error:", err);
      setError(err.response?.data?.message || "Failed to submit skip action.");
    } finally {
      setSubmitting(false);
    }
  };

  const [completing, setCompleting] = useState(false);

  // Auto navigate to result page if session is COMPLETED
  useEffect(() => {
    const sessionMeta = session?.session || session;
    if (sessionMeta?.status === "COMPLETED") {
      cancelTts();
      if (isListening) stopListening();
      navigate(`/interview/${sessionId}/result`, { replace: true });
    }
  }, [session, sessionId, navigate, cancelTts, isListening, stopListening]);

  // End Session Confirmation
  const handleConfirmEndSession = async () => {
    try {
      setShowEndModal(false);
      setCompleting(true);
      cancelTts();
      if (isListening) stopListening();

      const res = await interviewApi.completeSession(sessionId);
      if (res.success) {
        navigate(`/interview/${sessionId}/result`, { replace: true });
      }
    } catch (err) {
      console.error("Complete Session Error:", err);
      setError("Failed to complete interview session.");
    } finally {
      setCompleting(false);
    }
  };

  const sessionMeta = session?.session || session;

  // Render Completing / Analyzing Loading State
  if (completing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] text-center max-w-md mx-auto py-12 px-4">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full border-4 border-accent/20 border-t-accent animate-spin flex items-center justify-center" />
          <div className="absolute inset-0 flex items-center justify-center text-accent font-bold text-xs uppercase tracking-tighter">
            AI
          </div>
        </div>
        <h3 className="text-2xl font-bold text-white tracking-tight mb-2">Analyzing Your Performance</h3>
        <p className="text-text-secondary text-sm leading-relaxed mb-6 font-dm">
          Aggregating question scores, topic depth, and formulating personalized qualitative recommendations...
        </p>
        <div className="w-full bg-white/[0.05] border border-white/10 rounded-full h-1.5 overflow-hidden">
          <div className="bg-accent h-full w-2/3 animate-pulse rounded-full" />
        </div>
      </div>
    );
  }

  // Render Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 size={40} className="text-accent animate-spin mb-4" />
        <p className="text-text-secondary font-mono text-xs uppercase tracking-widest animate-pulse">
          Connecting to Voice Interview Room...
        </p>
      </div>
    );
  }

  // Render Error State
  if (error && !session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto text-center">
        <AlertTriangle size={40} className="text-error mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Session Load Error</h3>
        <p className="text-text-secondary text-sm mb-6">{error}</p>
        <div className="flex gap-4 w-full">
          <Button variant="outline" onClick={() => navigate("/interview")}>
            BACK TO PREP
          </Button>
          <Button onClick={fetchSessionState}>RETRY</Button>
        </div>
      </div>
    );
  }

  // Render Completion Screen if status is COMPLETED
  if (session && sessionMeta?.status === "COMPLETED") {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <Card className="max-w-none border-accent/20">
          <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/30 text-accent flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
            Interview Session Completed
          </h2>
          <p className="text-text-secondary text-sm max-w-md mx-auto mb-8 leading-relaxed font-dm">
            Great job! You have completed all questions for the <strong>{sessionMeta?.targetRole}</strong> interview session.
          </p>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 mb-8 font-mono text-xs text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-text-secondary">Total Questions:</span>
              <span className="text-white font-bold">{sessionMeta?.totalQuestions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Interview Focus:</span>
              <span className="text-accent font-bold">{sessionMeta?.interviewType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Difficulty Level:</span>
              <span className="text-white font-bold">{sessionMeta?.difficulty}</span>
            </div>
          </div>

          <Button onClick={() => navigate("/dashboard")}>
            <Home size={16} />
            <span>RETURN TO DASHBOARD</span>
          </Button>
        </Card>
      </div>
    );
  }

  const currentQuestion = session?.currentQuestion;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Top Header Progress Bar */}
      <InterviewProgress
        currentIndex={sessionMeta?.currentQuestionIndex || 1}
        totalQuestions={sessionMeta?.totalQuestions || 5}
        targetRole={sessionMeta?.targetRole || "Software Engineer"}
        interviewType={sessionMeta?.interviewType || "TECHNICAL"}
        difficulty={sessionMeta?.difficulty || "MEDIUM"}
        status={sessionMeta?.status}
        onEndInterview={() => setShowEndModal(true)}
      />

      {/* Main Question Display */}
      <InterviewQuestionCard
        question={currentQuestion}
        isSpeaking={isSpeaking}
        onReplay={() => replay()}
        onStopAudio={cancelTts}
      />

      {/* Voice Control Panel */}
      <VoiceAnswerPanel
        isListening={isListening}
        isSupported={sttSupported}
        isSpeaking={isSpeaking}
        submitting={submitting}
        inputMode={inputMode}
        error={sttError}
        onStartListening={handleStartListening}
        onStopListening={stopListening}
        onToggleInputMode={handleToggleInputMode}
        onSkipQuestion={handleSkipQuestion}
      />

      {/* Transcript Editor & Submission */}
      <TranscriptEditor
        transcript={transcript}
        setTranscript={setTranscript}
        inputMode={inputMode}
        isListening={isListening}
        isSpeaking={isSpeaking}
        submitting={submitting}
        onSubmit={handleSubmitAnswer}
      />

      {/* End Session Confirmation Modal */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-error/30">
            <h3 className="text-xl font-bold text-white mb-2">End Interview Session?</h3>
            <p className="text-text-secondary text-sm mb-6 leading-relaxed">
              Are you sure you want to end this interview session early? Your answered questions will be saved.
            </p>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setShowEndModal(false)}>
                CANCEL
              </Button>
              <button
                onClick={handleConfirmEndSession}
                className="w-full font-bold rounded-xl px-6 py-3.5 bg-error text-white hover:bg-error/80 transition-all text-sm uppercase tracking-wider"
              >
                END SESSION
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default InterviewRoomPage;
