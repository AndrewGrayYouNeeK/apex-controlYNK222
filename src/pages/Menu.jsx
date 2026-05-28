import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AIRPORTS, DIFFICULTY_LEVELS, CAREER_RANKS } from '@/lib/gameData';
import { Radio, Plane, AlertTriangle, CloudLightning, Trophy, ChevronRight, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Menu() {
  const [selectedAirport, setSelectedAirport] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [view, setView] = useState('main');

  // Load career progress
  const savedProgress = JSON.parse(localStorage.getItem('atc_career') || '{}');
  const totalXP = savedProgress.xp || 0;
  const currentRank = CAREER_RANKS.filter(r => r.xpRequired <= totalXP).pop() || CAREER_RANKS[0];
  const nextRank = CAREER_RANKS.find(r => r.xpRequired > totalXP);

  if (view === 'airport') return <AirportSelect onSelect={(a) => { setSelectedAirport(a); setView('difficulty'); }} onBack={() => setView('main')} />;
  if (view === 'difficulty') return <DifficultySelect airport={selectedAirport} onSelect={(d) => { setSelectedDifficulty(d); setView('ready'); }} onBack={() => setView('airport')} />;
  if (view === 'ready') return <ReadyScreen airport={selectedAirport} difficulty={selectedDifficulty} onBack={() => setView('difficulty')} />;
  if (view === 'career') return <CareerView xp={totalXP} rank={currentRank} onBack={() => setView('main')} />;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* CRT overlay */}
      <div className="crt-overlay" />

      {/* Background radar effect */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03]">
        <div className="w-[800px] h-[800px] rounded-full border border-primary radar-sweep" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-lg w-full text-center"
      >
        {/* Logo */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Radio className="w-8 h-8 text-primary text-glow" />
            <h1 className="font-display text-3xl md:text-4xl text-primary text-glow tracking-wider">
              YOUNEEK APEX CONTROL
            </h1>
          </div>
          <p className="font-mono text-xs text-muted-foreground tracking-widest uppercase">
            Air Traffic Control Simulator
          </p>
          <div className="mt-3 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </div>

        {/* Career status */}
        <div className="mb-8 border border-border/30 rounded bg-card/30 p-3">
          <div className="flex items-center justify-between">
            <div className="text-left">
              <div className="font-mono text-[10px] text-muted-foreground uppercase">RANK</div>
              <div className="font-display text-sm text-primary text-glow">{currentRank.title}</div>
            </div>
            <div className="text-right">
              <div className="font-mono text-[10px] text-muted-foreground uppercase">XP</div>
              <div className="font-mono text-sm text-primary text-glow">{totalXP.toLocaleString()}</div>
            </div>
          </div>
          {nextRank && (
            <div className="mt-2">
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${((totalXP - currentRank.xpRequired) / (nextRank.xpRequired - currentRank.xpRequired)) * 100}%` }}
                />
              </div>
              <div className="font-mono text-[9px] text-muted-foreground mt-1">
                {nextRank.xpRequired - totalXP} XP to {nextRank.title}
              </div>
            </div>
          )}
        </div>

        {/* Menu buttons */}
        <div className="space-y-3">
          <MenuButton
            icon={<Plane className="w-5 h-5" />}
            label="FREE PLAY"
            desc="Choose your airport and difficulty"
            onClick={() => setView('airport')}
          />
          <MenuButton
            icon={<Trophy className="w-5 h-5" />}
            label="CAREER MODE"
            desc={`Level ${currentRank.level} — ${currentRank.description}`}
            onClick={() => setView('career')}
          />
          <MenuButton
            icon={<AlertTriangle className="w-5 h-5" />}
            label="EMERGENCY DRILLS"
            desc="Practice handling worst-case scenarios"
            onClick={() => {
              setSelectedAirport(AIRPORTS.find(a => a.id === 'KJFK'));
              setSelectedDifficulty(DIFFICULTY_LEVELS.find(d => d.id === 'hard'));
              setView('ready');
            }}
          />
        </div>

        <div className="mt-8 font-mono text-[9px] text-muted-foreground/40 space-y-1">
          <p>Voice commands powered by Web Speech API</p>
          <p>Use Chrome for best voice recognition support</p>
        </div>
      </motion.div>
    </div>
  );
}

function MenuButton({ icon, label, desc, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 border border-border/30 rounded bg-card/30 hover:bg-card/60 hover:border-primary/30 transition-all group text-left"
    >
      <div className="text-primary/60 group-hover:text-primary transition-colors">
        {icon}
      </div>
      <div className="flex-1">
        <div className="font-display text-xs text-primary group-hover:text-glow tracking-wider">{label}</div>
        <div className="font-mono text-[10px] text-muted-foreground mt-0.5">{desc}</div>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
    </button>
  );
}

function AirportSelect({ onSelect, onBack }) {
  const groups = {
    BEGINNER: AIRPORTS.filter(a => a.difficulty === 'BEGINNER'),
    EASY: AIRPORTS.filter(a => a.difficulty === 'EASY'),
    MEDIUM: AIRPORTS.filter(a => a.difficulty === 'MEDIUM'),
    HARD: AIRPORTS.filter(a => a.difficulty === 'HARD'),
    EXPERT: AIRPORTS.filter(a => a.difficulty === 'EXPERT'),
  };

  const diffColors = {
    BEGINNER: 'text-green-400 border-green-400/30',
    EASY: 'text-blue-400 border-blue-400/30',
    MEDIUM: 'text-accent border-accent/30',
    HARD: 'text-orange-400 border-orange-400/30',
    EXPERT: 'text-destructive border-destructive/30',
  };

  return (
    <div className="min-h-screen bg-background p-6 relative">
      <div className="crt-overlay" />
      <div className="max-w-2xl mx-auto relative z-10">
        <button onClick={onBack} className="font-mono text-xs text-muted-foreground hover:text-primary mb-4">
          ← BACK
        </button>
        <h2 className="font-display text-xl text-primary text-glow tracking-wider mb-6">SELECT FACILITY</h2>

        {Object.entries(groups).map(([diff, airports]) => (
          airports.length > 0 && (
            <div key={diff} className="mb-4">
              <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-2">{diff}</div>
              <div className="space-y-2">
                {airports.map(airport => (
                  <button
                    key={airport.id}
                    onClick={() => onSelect(airport)}
                    className={`w-full text-left p-3 border rounded bg-card/30 hover:bg-card/60 transition-all ${diffColors[diff]}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-display text-xs tracking-wider">{airport.id}</span>
                        <span className="font-mono text-xs text-muted-foreground ml-2">{airport.name}</span>
                      </div>
                      <Badge variant="outline" className={`text-[8px] ${diffColors[diff]}`}>
                        {airport.runways.length} RWY
                      </Badge>
                    </div>
                    <p className="font-mono text-[10px] text-muted-foreground/60 mt-1">{airport.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}

function DifficultySelect({ airport, onSelect, onBack }) {
  const diffColors = {
    tutorial: 'border-green-400/30 hover:border-green-400/60 text-green-400',
    beginner: 'border-blue-400/30 hover:border-blue-400/60 text-blue-400',
    medium: 'border-accent/30 hover:border-accent/60 text-accent',
    hard: 'border-orange-400/30 hover:border-orange-400/60 text-orange-400',
    expert: 'border-red-400/30 hover:border-red-400/60 text-red-400',
    insane: 'border-destructive/50 hover:border-destructive text-destructive',
  };

  return (
    <div className="min-h-screen bg-background p-6 relative">
      <div className="crt-overlay" />
      <div className="max-w-lg mx-auto relative z-10">
        <button onClick={onBack} className="font-mono text-xs text-muted-foreground hover:text-primary mb-4">
          ← BACK
        </button>
        <h2 className="font-display text-xl text-primary text-glow tracking-wider mb-2">SELECT DIFFICULTY</h2>
        <p className="font-mono text-xs text-muted-foreground mb-6">{airport.id} — {airport.name}</p>

        <div className="space-y-2">
          {DIFFICULTY_LEVELS.map(d => (
            <button
              key={d.id}
              onClick={() => onSelect(d)}
              className={`w-full text-left p-3 border rounded bg-card/30 hover:bg-card/60 transition-all ${diffColors[d.id]}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-xs tracking-wider">{d.label}</span>
                <span className="font-mono text-[10px] text-muted-foreground">{d.name}</span>
              </div>
              <p className="font-mono text-[10px] text-muted-foreground/60 mt-1">{d.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReadyScreen({ airport, difficulty, onBack }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative">
      <div className="crt-overlay" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 max-w-md w-full text-center"
      >
        <div className="font-display text-2xl text-primary text-glow tracking-wider mb-2">{airport.id}</div>
        <div className="font-mono text-xs text-muted-foreground mb-1">{airport.name}</div>
        <div className={`font-display text-xs tracking-wider mb-6 ${
          difficulty.id === 'insane' ? 'text-destructive text-glow-red' : 'text-accent text-glow-amber'
        }`}>
          {difficulty.label}
        </div>

        <div className="border border-border/30 rounded bg-card/30 p-4 mb-6 text-left space-y-2">
          <InfoRow label="Runways" value={airport.runways.map(r => r.id).join(', ')} />
          <InfoRow label="Traffic" value={`${Math.floor(airport.trafficDensity * difficulty.trafficMult)} aircraft/cycle`} />
          <InfoRow label="Emergencies" value={difficulty.emergencyChance > 0 ? `${difficulty.emergencyChance * 100}% chance` : 'None'} />
          <InfoRow label="Weather" value={`Severity up to ${difficulty.weatherMax}/5`} />
        </div>

        <div className="space-y-3">
          <Link
            to={`/sim?airport=${airport.id}&difficulty=${difficulty.id}`}
            className="block w-full"
          >
            <Button
              size="lg"
              className="w-full font-display tracking-wider text-sm bg-primary text-primary-foreground hover:bg-primary/80"
            >
              CLEAR FOR TAKEOFF
            </Button>
          </Link>
          <button onClick={onBack} className="font-mono text-xs text-muted-foreground hover:text-primary">
            ← CHANGE SETTINGS
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between font-mono text-[10px]">
      <span className="text-muted-foreground uppercase">{label}</span>
      <span className="text-primary">{value}</span>
    </div>
  );
}

function CareerView({ xp, rank, onBack }) {
  return (
    <div className="min-h-screen bg-background p-6 relative">
      <div className="crt-overlay" />
      <div className="max-w-lg mx-auto relative z-10">
        <button onClick={onBack} className="font-mono text-xs text-muted-foreground hover:text-primary mb-4">
          ← BACK
        </button>
        <h2 className="font-display text-xl text-primary text-glow tracking-wider mb-6">CAREER PROGRESS</h2>

        <div className="space-y-2">
          {CAREER_RANKS.map(r => {
            const unlocked = xp >= r.xpRequired;
            const isCurrent = r.level === rank.level;
            return (
              <div
                key={r.level}
                className={`p-3 border rounded transition-all ${
                  isCurrent ? 'border-primary bg-primary/10' :
                  unlocked ? 'border-border/50 bg-card/50' :
                  'border-border/20 bg-card/20 opacity-40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-xs text-primary">{r.level}</span>
                    <span className={`font-mono text-xs ${isCurrent ? 'text-primary text-glow' : 'text-muted-foreground'}`}>
                      {r.title}
                    </span>
                    {isCurrent && <Badge variant="outline" className="text-[8px] border-primary text-primary">CURRENT</Badge>}
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">{r.xpRequired.toLocaleString()} XP</span>
                </div>
                <p className="font-mono text-[9px] text-muted-foreground/60 mt-1">{r.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-6">
          <Link to={`/sim?airport=KOSH&difficulty=tutorial`}>
            <Button variant="outline" className="w-full font-display tracking-wider text-xs border-primary/30 text-primary">
              START TRAINING
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}