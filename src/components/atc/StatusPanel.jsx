import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Wind, Eye, CloudRain, Thermometer, AlertTriangle, Clock, Target, Trophy } from 'lucide-react';

export default function StatusPanel({ weather, airport, score, conflicts, aircraft, gameTime, difficulty }) {
  const minutes = Math.floor(gameTime / 60);
  const seconds = gameTime % 60;
  const arrivals = aircraft.filter(a => a.type === 'arrival').length;
  const departures = aircraft.filter(a => a.type === 'departure').length;
  const emergencies = aircraft.filter(a => a.emergency).length;

  return (
    <div className="space-y-3">
      {/* Airport info */}
      <div className="border border-border/50 rounded bg-card/50 p-2">
        <div className="font-display text-[10px] text-primary text-glow tracking-widest mb-1">
          {airport?.id || 'N/A'}
        </div>
        <div className="font-mono text-[10px] text-muted-foreground">
          {airport?.name || 'No Airport Selected'}
        </div>
      </div>

      {/* Time & Score */}
      <div className="grid grid-cols-2 gap-2">
        <div className="border border-border/50 rounded bg-card/50 p-2">
          <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-mono uppercase mb-1">
            <Clock className="w-3 h-3" /> TIME
          </div>
          <div className="font-display text-sm text-primary text-glow">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        </div>
        <div className="border border-border/50 rounded bg-card/50 p-2">
          <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-mono uppercase mb-1">
            <Trophy className="w-3 h-3" /> SCORE
          </div>
          <div className="font-display text-sm text-primary text-glow">
            {score.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Traffic count */}
      <div className="border border-border/50 rounded bg-card/50 p-2">
        <div className="text-[9px] text-muted-foreground font-mono uppercase mb-1">TRAFFIC</div>
        <div className="grid grid-cols-3 gap-1">
          <div>
            <span className="text-blue-400 font-mono text-xs">{arrivals}</span>
            <span className="text-[8px] text-muted-foreground ml-1">ARR</span>
          </div>
          <div>
            <span className="text-green-400 font-mono text-xs">{departures}</span>
            <span className="text-[8px] text-muted-foreground ml-1">DEP</span>
          </div>
          <div>
            <span className={`font-mono text-xs ${emergencies > 0 ? 'text-destructive emergency-flash' : 'text-muted-foreground'}`}>
              {emergencies}
            </span>
            <span className="text-[8px] text-muted-foreground ml-1">EMG</span>
          </div>
        </div>
      </div>

      {/* Weather */}
      {weather && (
        <div className={`border rounded bg-card/50 p-2 ${weather.severity > 2 ? 'border-destructive/50' : 'border-border/50'}`}>
          <div className="text-[9px] text-muted-foreground font-mono uppercase mb-1">WEATHER</div>
          <div className={`font-mono text-xs mb-1 ${weather.severity > 2 ? 'text-destructive text-glow-red' : 'text-primary'}`}>
            {weather.name}
          </div>
          <div className="space-y-0.5 text-[9px] font-mono text-muted-foreground">
            <div className="flex items-center gap-1">
              <Wind className="w-3 h-3" />
              {weather.wind.direction}° @ {weather.wind.speed}KT
              {weather.wind.gusts > 0 && <span className="text-accent"> G{weather.wind.gusts}</span>}
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              VIS {weather.visibility === 'unlimited' ? '10+' : weather.visibility}SM
            </div>
            {weather.ceiling !== 'none' && (
              <div className="flex items-center gap-1">
                <CloudRain className="w-3 h-3" />
                CIG {weather.ceiling}FT
              </div>
            )}
          </div>
        </div>
      )}

      {/* Conflicts */}
      {conflicts.length > 0 && (
        <div className="border border-destructive/70 rounded bg-destructive/10 p-2 emergency-flash">
          <div className="flex items-center gap-1 text-[9px] text-destructive font-mono uppercase font-bold">
            <AlertTriangle className="w-3 h-3" /> CONFLICT ALERT
          </div>
          {conflicts.map(c => (
            <div key={c.id} className="text-[9px] font-mono text-destructive mt-1">
              {c.aircraft1.callsign} / {c.aircraft2.callsign}
            </div>
          ))}
        </div>
      )}

      {/* Difficulty */}
      <div className="border border-border/50 rounded bg-card/50 p-2">
        <div className="text-[9px] text-muted-foreground font-mono uppercase mb-1">DIFFICULTY</div>
        <div className={`font-mono text-xs ${
          difficulty?.id === 'insane' ? 'text-destructive text-glow-red' :
          difficulty?.id === 'expert' ? 'text-accent text-glow-amber' :
          'text-primary text-glow'
        }`}>
          {difficulty?.label || 'N/A'}
        </div>
      </div>
    </div>
  );
}