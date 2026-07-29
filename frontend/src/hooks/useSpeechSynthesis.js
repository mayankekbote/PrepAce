import { useState, useEffect, useRef, useCallback } from "react";

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const lastSpokenTextRef = useRef("");

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setSupported(true);
    }
  }, []);

  const cancel = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const speak = useCallback(
    (text, onEnd) => {
      if (!supported || !text) {
        if (onEnd) onEnd();
        return;
      }

      // Always cancel previous speech before speaking new text
      window.speechSynthesis.cancel();
      lastSpokenTextRef.current = text;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.lang = "en-US";

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        console.warn("Speech synthesis error:", e);
        setIsSpeaking(false);
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    },
    [supported]
  );

  const replay = useCallback(
    (onEnd) => {
      if (lastSpokenTextRef.current) {
        speak(lastSpokenTextRef.current, onEnd);
      }
    },
    [speak]
  );

  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    isSpeaking,
    supported,
    speak,
    cancel,
    replay,
  };
};

export default useSpeechSynthesis;
