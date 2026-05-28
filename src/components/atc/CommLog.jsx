import React, { useRef, useEffect } from 'react';

export default function CommLog({ messages }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={scrollRef}
      className="font-mono text-[10px] space-y-1 max-h-[200px] overflow-y-auto pr-1"
    >
      {messages.map((msg, i) => (
        <div key={i} className={`leading-tight ${getMessageStyle(msg.type)}`}>
          <span className="text-muted-foreground/50">{msg.time}</span>{' '}
          {msg.sender && (
            <span className={`font-bold ${msg.type === 'pilot' ? 'text-blue-400' : msg.type === 'controller' ? 'text-primary text-glow' : msg.type === 'instructor' ? 'text-accent text-glow-amber' : msg.type === 'system' ? 'text-destructive' : 'text-muted-foreground'}`}>
              [{msg.sender}]
            </span>
          )}{' '}
          <span className={msg.type === 'system' ? 'text-destructive text-glow-red' : msg.type === 'instructor' ? 'text-accent' : ''}>
            {msg.text}
          </span>
        </div>
      ))}
      {messages.length === 0 && (
        <div className="text-muted-foreground/30 text-center py-4">
          Frequency quiet...
        </div>
      )}
    </div>
  );
}

function getMessageStyle(type) {
  switch (type) {
    case 'pilot': return '';
    case 'controller': return '';
    case 'instructor': return 'bg-accent/5 px-1 rounded';
    case 'system': return 'bg-destructive/5 px-1 rounded';
    case 'alert': return 'bg-destructive/10 px-1 rounded emergency-flash';
    default: return '';
  }
}