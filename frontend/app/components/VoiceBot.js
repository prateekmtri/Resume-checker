"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";

const VOICE_API_URL =
  (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1") + "/voice/chat";

export default function VoiceBot() {
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef(null);
  const sessionIdRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      sendToBackend(text);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
  }, []);

  const sendToBackend = async (message) => {
    setLoading(true);
    try {
      const res = await fetch(VOICE_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, session_id: sessionIdRef.current }),
      });
      if (!res.ok) throw new Error("Voice API error");

      const data = await res.json();
      sessionIdRef.current = data.session_id;
      speak(data.response);
    } catch (err) {
      console.error("Voice bot error:", err);
      speak("Sorry, something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const speak = (text) => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in this browser. Try Chrome.");
      return;
    }
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  return (
    <button
      onClick={toggleListening}
      disabled={loading}
      title={listening ? "Listening... click to stop" : "Ask JobAI"}
      className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all
        ${listening ? "bg-red-500 animate-pulse" : "bg-blue-600 hover:bg-blue-700"}
        ${loading ? "opacity-70 cursor-wait" : ""}`}
    >
      {loading ? (
        <Loader2 className="w-6 h-6 text-white animate-spin" />
      ) : listening ? (
        <MicOff className="w-6 h-6 text-white" />
      ) : (
        <Mic className="w-6 h-6 text-white" />
      )}
    </button>
  );
}