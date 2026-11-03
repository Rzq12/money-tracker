import { useEffect, useRef, useState } from 'react';

/** Browser speech recognition, with a graceful unsupported fallback. */
export const useSpeech = (onResult, { lang = 'id-ID' } = {}) => {
  const [supported] = useState(() => typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition));
  const [listening, setListening] = useState(false);
  const recognition = useRef(null);
  const callback = useRef(onResult);
  callback.current = onResult;

  useEffect(() => () => {
    try { recognition.current?.abort(); } catch { /* already stopped */ }
  }, []);

  const stop = () => {
    try { recognition.current?.stop(); } catch { /* already stopped */ }
    setListening(false);
  };

  const start = () => {
    const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Speech) return false;
    try {
      const instance = new Speech();
      instance.lang = lang;
      instance.interimResults = false;
      instance.maxAlternatives = 1;
      instance.onresult = (event) => {
        const text = event.results?.[0]?.[0]?.transcript || '';
        if (text) callback.current?.(text);
      };
      instance.onerror = () => setListening(false);
      instance.onend = () => setListening(false);
      instance.start();
      recognition.current = instance;
      setListening(true);
      return true;
    } catch {
      setListening(false);
      return false;
    }
  };

  return { supported, listening, start, stop, toggle: () => (listening ? stop() : start()) };
};
