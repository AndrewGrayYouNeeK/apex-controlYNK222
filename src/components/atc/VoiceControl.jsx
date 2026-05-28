import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VoiceControl({ onCommand, isListening, setIsListening, enabled }) {
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const recognitionRef = useRef(null);

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interimText = '';
      let finalText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }

      if (finalText) {
        setTranscript(finalText);
        onCommand(finalText);
        setTimeout(() => setTranscript(''), 3000);
      }
      setInterim(interimText);
    };

    recognition.onerror = (event) => {
      if (event.error !== 'no-speech') {
        console.error('Speech error:', event.error);
      }
    };

    recognition.onend = () => {
      if (isListening) {
        try { recognition.start(); } catch (e) { /* ignore */ }
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [onCommand, isListening, setIsListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterim('');
  }, [setIsListening]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="relative">
      {/* Mic button */}
      <div className="flex items-center gap-3">
        <Button
          onClick={toggleListening}
          disabled={!enabled}
          variant="outline"
          size="lg"
          className={`
            relative rounded-full w-14 h-14 p-0
            ${isListening
              ? 'border-primary bg-primary/20 text-primary mic-pulse'
              : 'border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary'
            }
            ${!enabled ? 'opacity-30' : ''}
          `}
        >
          {isListening ? (
            <Radio className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </Button>

        <div className="flex-1 min-w-0">
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
            {isListening ? 'TRANSMITTING' : 'PTT OFF'}
          </div>
          <div className="font-mono text-xs text-primary min-h-[2.5rem] max-h-[2.5rem] overflow-hidden">
            {transcript && (
              <span className="text-glow">{transcript}</span>
            )}
            {interim && (
              <span className="text-muted-foreground italic">{interim}</span>
            )}
            {!transcript && !interim && isListening && (
              <span className="text-muted-foreground/50 phosphor-pulse">Listening...</span>
            )}
            {!isListening && !transcript && (
              <span className="text-muted-foreground/30">Click mic or press SPACE to transmit</span>
            )}
          </div>
        </div>
      </div>

      {/* Visual indicator bar */}
      {isListening && (
        <div className="mt-2 flex gap-0.5 items-end h-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-primary/60 rounded-sm"
              style={{
                height: `${Math.random() * 100}%`,
                transition: 'height 0.1s',
                animationDelay: `${i * 50}ms`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}