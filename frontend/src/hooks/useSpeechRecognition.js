import { useState, useEffect, useRef, useCallback } from "react";

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [confidenceScore, setConfidenceScore] = useState(null);
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const shouldListenRef = useRef(false);

  const SpeechRecognition =
    typeof window !== "undefined"
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;

  const isSupported = Boolean(SpeechRecognition);

  useEffect(() => {
    return () => {
      shouldListenRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore unmount stop error
        }
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    setError(null);
    shouldListenRef.current = true;

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      let finalTranscriptAcc = "";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let interimTranscriptAcc = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          const text = res[0].transcript;

          if (res.isFinal) {
            finalTranscriptAcc += text + " ";
            if (res[0].confidence) {
              setConfidenceScore(Math.round(res[0].confidence * 100) / 100);
            }
          } else {
            interimTranscriptAcc += text;
          }
        }

        const currentCombined = (finalTranscriptAcc + interimTranscriptAcc).trim();
        setTranscript(currentCombined);
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          shouldListenRef.current = false;
          setError("Microphone permission was denied.");
          setIsListening(false);
        } else if (event.error === "no-speech" || event.error === "network") {
          // Soft errors: do not kill recording if user wants to keep microphone active
        } else {
          setError(`Speech recognition event: ${event.error}`);
        }
      };

      recognition.onend = () => {
        if (shouldListenRef.current) {
          try {
            recognition.start();
          } catch (e) {
            console.warn("Auto-restart speech recognition failed:", e);
            setIsListening(false);
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setError("Could not activate microphone recognition.");
      shouldListenRef.current = false;
      setIsListening(false);
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setConfidenceScore(null);
    setError(null);
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    setTranscript,
    confidenceScore,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
};

export default useSpeechRecognition;
