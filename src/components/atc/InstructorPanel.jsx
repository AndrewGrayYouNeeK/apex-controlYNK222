import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

export default function InstructorPanel({ feedback, show }) {
  if (!feedback || !show) return null;

  const icons = {
    good: <CheckCircle className="w-4 h-4 text-primary" />,
    bad: <XCircle className="w-4 h-4 text-destructive" />,
    emergency: <AlertTriangle className="w-4 h-4 text-accent" />,
    near_miss: <AlertTriangle className="w-4 h-4 text-destructive" />,
    weather: <Info className="w-4 h-4 text-blue-400" />,
    info: <Info className="w-4 h-4 text-muted-foreground" />,
  };

  const bgColors = {
    good: 'border-primary/30 bg-primary/5',
    bad: 'border-destructive/30 bg-destructive/5',
    emergency: 'border-accent/30 bg-accent/5',
    near_miss: 'border-destructive/50 bg-destructive/10 emergency-flash',
    weather: 'border-blue-400/30 bg-blue-400/5',
    info: 'border-muted-foreground/30 bg-muted/50',
  };

  return (
    <div className={`border rounded p-2 flex items-start gap-2 transition-all duration-300 ${bgColors[feedback.type] || bgColors.info}`}>
      {icons[feedback.type] || icons.info}
      <div className="flex-1 min-w-0">
        <div className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">
          INSTRUCTOR
        </div>
        <p className={`font-mono text-xs leading-relaxed ${
          feedback.type === 'bad' || feedback.type === 'near_miss' ? 'text-destructive' :
          feedback.type === 'good' ? 'text-primary' :
          feedback.type === 'emergency' ? 'text-accent' :
          'text-foreground'
        }`}>
          {feedback.text}
        </p>
      </div>
    </div>
  );
}