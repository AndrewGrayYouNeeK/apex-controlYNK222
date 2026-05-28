import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Plane, AlertTriangle, ArrowUp, ArrowDown, Radio } from 'lucide-react';

export default function FlightStrips({ aircraft, selectedAircraft, onSelectAircraft }) {
  const sorted = [...aircraft].sort((a, b) => {
    if (a.emergency && !b.emergency) return -1;
    if (!a.emergency && b.emergency) return 1;
    return a.altitude - b.altitude;
  });

  return (
    <div className="space-y-1 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
      {sorted.map(ac => (
        <FlightStrip
          key={ac.id}
          aircraft={ac}
          isSelected={ac.id === selectedAircraft}
          onClick={() => onSelectAircraft(ac.id)}
        />
      ))}
      {aircraft.length === 0 && (
        <div className="text-center py-8 text-muted-foreground font-mono text-xs">
          NO TRAFFIC ON FREQUENCY
        </div>
      )}
    </div>
  );
}

function FlightStrip({ aircraft: ac, isSelected, onClick }) {
  const isEmergency = !!ac.emergency;
  const categoryColors = {
    SMALL: 'text-blue-400',
    LARGE: 'text-primary',
    HEAVY: 'text-accent',
    SUPER: 'text-destructive',
  };

  return (
    <div
      onClick={onClick}
      className={`
        font-mono text-[10px] cursor-pointer transition-all duration-150 rounded
        border p-1.5 relative overflow-hidden
        ${isSelected
          ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
          : isEmergency
            ? 'border-destructive/50 bg-destructive/5'
            : 'border-border/50 bg-card/50 hover:border-primary/30 hover:bg-card/80'
        }
      `}
    >
      {isEmergency && (
        <div className="absolute inset-0 bg-destructive/5 emergency-flash pointer-events-none" />
      )}

      <div className="flex items-center justify-between gap-2 relative z-10">
        <div className="flex items-center gap-1.5">
          {ac.type === 'arrival' ? (
            <ArrowDown className="w-3 h-3 text-blue-400" />
          ) : (
            <ArrowUp className="w-3 h-3 text-green-400" />
          )}
          <span className={`font-bold ${isEmergency ? 'text-destructive text-glow-red' : 'text-primary text-glow'}`}>
            {ac.callsign}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span className={categoryColors[ac.aircraft.category]}>
            {ac.aircraft.type}
          </span>
          {ac.aircraft.category === 'HEAVY' && (
            <Badge variant="outline" className="text-[8px] px-1 py-0 h-3 border-accent text-accent">H</Badge>
          )}
          {ac.aircraft.category === 'SUPER' && (
            <Badge variant="outline" className="text-[8px] px-1 py-0 h-3 border-destructive text-destructive">S</Badge>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-1 relative z-10">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span>ALT {String(Math.floor(ac.altitude / 100)).padStart(3, '0')}</span>
          <span>HDG {String(Math.floor(ac.heading)).padStart(3, '0')}</span>
          <span>SPD {Math.floor(ac.speed)}</span>
        </div>

        <div className="flex items-center gap-1">
          {isEmergency && (
            <Badge variant="destructive" className="text-[8px] px-1 py-0 h-3 emergency-flash">
              {ac.squawk}
            </Badge>
          )}
          <Badge
            variant="outline"
            className={`text-[8px] px-1 py-0 h-3 ${
              ac.status === 'APPROACH' ? 'border-blue-400 text-blue-400' :
              ac.status === 'GO AROUND' ? 'border-accent text-accent' :
              ac.status === 'DEPARTING' ? 'border-green-400 text-green-400' :
              'border-muted-foreground text-muted-foreground'
            }`}
          >
            {ac.status}
          </Badge>
        </div>
      </div>

      {isEmergency && (
        <div className="mt-1 flex items-center gap-1 text-destructive relative z-10">
          <AlertTriangle className="w-3 h-3" />
          <span className="text-glow-red font-bold">{ac.emergency.name}</span>
        </div>
      )}
    </div>
  );
}