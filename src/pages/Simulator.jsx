import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AIRPORTS, DIFFICULTY_LEVELS, CAREER_MISSIONS } from '@/lib/gameData';
import {
  createAircraft, updateAircraft, checkConflicts, generateEmergency,
  getWeatherForDifficulty, getInstructorFeedback, parseVoiceCommand,
  generateReadback, applyCommands, calculateScore
} from '@/lib/gameEngine';
import { awardSessionXp } from '@/lib/careerProgress';
import RadarScope from '@/components/atc/RadarScope';
import FlightStrips from '@/components/atc/FlightStrips';
import StatusPanel from '@/components/atc/StatusPanel';
import CommLog from '@/components/atc/CommLog';
import VoiceControl from '@/components/atc/VoiceControl';
import InstructorPanel from '@/components/atc/InstructorPanel';
import CommandInput from '@/components/atc/CommandInput';
import TutorialOverlay, { TUTORIAL_STEPS } from '@/components/atc/TutorialOverlay';
import { Radio, Pause, Play, LogOut, Volume2, VolumeX, Trophy } from 'lucide-react';
import { initAudio, startAmbience, stopAmbience, startMusic, stopMusic, sfx, haptic, getSoundSettings } from '@/lib/soundEngine';

const MAX_STRIKES = 3;
const MIN_SCORE = -1500;

export default function Simulator() {
  const urlParams = new URLSearchParams(window.location.search);
  const airportId = urlParams.get('airport') || 'KOSH';
  const difficultyId = urlParams.get('difficulty') || 'tutorial';
  const missionId = urlParams.get('mission');

  const airport = AIRPORTS.find(a => a.id === airportId) || AIRPORTS[0];
  const difficulty = DIFFICULTY_LEVELS.find(d => d.id === difficultyId) || DIFFICULTY_LEVELS[0];
  const mission = missionId ? CAREER_MISSIONS.find(m => m.id === missionId) : null;

  const [aircraft, setAircraft] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [selectedAircraft, setSelectedAircraft] = useState(null);
  const [messages, setMessages] = useState([]);
  const [score, setScore] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [weather, setWeather] = useState(() => getWeatherForDifficulty(difficulty));
  const [paused, setPaused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [sweepAngle, setSweepAngle] = useState(0);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [gameOverReason, setGameOverReason] = useState(null);
  const [strikes, setStrikes] = useState(0);
  const [stats, setStats] = useState({ landings: 0, departures: 0, emergencies: 0 });

  const [tutorialStep, setTutorialStep] = useState(difficultyId === 'tutorial' ? 0 : -1);
  const tutorialActive = tutorialStep >= 0 && tutorialStep < TUTORIAL_STEPS.length;
  const tutorialStepRef = useRef(tutorialStep);
  tutorialStepRef.current = tutorialStep;

  const advanceTutorial = useCallback((fromStepId) => {
    setTutorialStep(prev => {
      if (prev < 0) return prev;
      if (fromStepId && TUTORIAL_STEPS[prev]?.id !== fromStepId) return prev;
      return prev + 1;
    });
  }, []);

  const skipTutorial = useCallback(() => setTutorialStep(-1), []);

  const handleSelectAircraft = useCallback((id) => {
    setSelectedAircraft(id);
    if (id) advanceTutorial('select');
  }, [advanceTutorial]);

  const aircraftRef = useRef(aircraft);
  const scoreRef = useRef(score);
  const gameOverRef = useRef(false);
  const prevCriticalRef = useRef(new Set());
  const lastUpdateRef = useRef(Date.now());

  aircraftRef.current = aircraft;
  scoreRef.current = score;

  const endGame = useCallback((reason) => {
    if (gameOverRef.current) return;
    gameOverRef.current = true;
    setGameOverReason(reason);
    setGameOver(true);
  }, []);

  const addMessage = useCallback((type, sender, text) => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    setMessages(prev => [...prev.slice(-50), { type, sender, text, time }]);
  }, []);

  const speak = useCallback((text) => {
    if (!ttsEnabled) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = 0.9;
    utterance.volume = 0.7;
    const voices = speechSynthesis.getVoices();
    const maleVoice = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('male'));
    if (maleVoice) utterance.voice = maleVoice;
    speechSynthesis.speak(utterance);
  }, [ttsEnabled]);

  const showFeedback = useCallback((type, text) => {
    setFeedback({ type, text });
    addMessage('instructor', 'INSTRUCTOR', text);
    setTimeout(() => setFeedback(null), 5000);
  }, [addMessage]);

  const registerStrike = useCallback(() => {
    setStrikes(prev => {
      const next = prev + 1;
      if (next >= MAX_STRIKES) endGame('strikes');
      return next;
    });
  }, [endGame]);

  const handleCommand = useCallback((transcript) => {
    const parsed = parseVoiceCommand(transcript, aircraftRef.current);
    addMessage('controller', 'YOU', transcript);

    if (!parsed.valid || !parsed.callsign) {
      addMessage('system', 'SYSTEM', 'Callsign not recognized. Try again.');
      if (difficulty.id !== 'tutorial') {
        showFeedback('bad', "Who are you talking to? Use the correct callsign.");
      }
      return;
    }

    if (parsed.commands.length === 0) {
      addMessage('system', 'SYSTEM', 'No valid command detected.');
      return;
    }

    const ac = aircraftRef.current.find(a => a.id === parsed.callsign);
    if (!ac) return;

    const readback = generateReadback(parsed, ac);
    sfx.radioStart();
    sfx.command();
    haptic(8);
    addMessage('pilot', ac.callsign, readback);
    speak(readback);
    setTimeout(() => sfx.radioEnd(), 250);

    setAircraft(prev => prev.map(a => {
      if (a.id === parsed.callsign) {
        return applyCommands({ ...a }, parsed.commands);
      }
      return a;
    }));

    setScore(prev => prev + calculateScore('good_separation', difficulty.id));
    if (Math.random() > 0.7) {
      showFeedback('good', getInstructorFeedback('good'));
    }

    const types = parsed.commands.map(c => c.type);
    const curStep = TUTORIAL_STEPS[tutorialStepRef.current];
    if (curStep) {
      if (curStep.id === 'heading' && types.includes('heading')) advanceTutorial('heading');
      else if (curStep.id === 'altitude' && types.includes('altitude')) advanceTutorial('altitude');
      else if (curStep.id === 'land' && types.includes('cleared_approach')) advanceTutorial('land');
    }
  }, [addMessage, speak, showFeedback, difficulty, advanceTutorial]);

  const spawnAircraft = useCallback(() => {
    if (paused || gameOver) return;
    const maxTraffic = Math.max(3, Math.round(airport.trafficDensity * difficulty.trafficMult));
    if (aircraftRef.current.length >= maxTraffic) return;

    const type = Math.random() > 0.4 ? 'arrival' : 'departure';
    const newAc = createAircraft(airport, type);
    setAircraft(prev => [...prev, newAc]);
    addMessage('pilot', newAc.callsign, `${airport.id} ${type === 'arrival' ? 'Approach' : 'Tower'}, ${newAc.spoken}, ${newAc.aircraft.type}, ${type === 'arrival' ? `inbound from the ${['north', 'south', 'east', 'west'][Math.floor(Math.random() * 4)]}, altitude ${Math.floor(newAc.altitude / 1000)} thousand` : 'ready for departure'}.`);
    speak(`${airport.id} ${type === 'arrival' ? 'Approach' : 'Tower'}, ${newAc.spoken}`);

    if (aircraftRef.current.length > 2) {
      const emg = generateEmergency(aircraftRef.current, difficulty);
      if (emg) {
        sfx.emergency();
        haptic([40, 30, 40]);
        addMessage('alert', emg.aircraft.callsign, `MAYDAY MAYDAY MAYDAY, ${emg.aircraft.spoken}, ${emg.emergency.description}`);
        showFeedback('emergency', getInstructorFeedback('emergency'));
        speak(`MAYDAY MAYDAY MAYDAY, ${emg.aircraft.spoken}, declaring emergency`);
      }
    }
  }, [airport, difficulty, paused, gameOver, addMessage, speak, showFeedback]);

  useEffect(() => {
    if (paused || gameOver) return;

    const loop = setInterval(() => {
      const now = Date.now();
      const delta = now - lastUpdateRef.current;
      lastUpdateRef.current = now;

      setSweepAngle(prev => (prev + (360 / 4000) * delta) % 360);
      setGameTime(prev => prev + 1);

      setAircraft(prev => {
        const updated = prev.map(ac => updateAircraft({ ...ac }, delta)).filter(ac => !ac.offScreen);

        const landed = [];
        const remaining = updated.filter(ac => {
          if (ac.cleared && ac.altitude < 500 && Math.sqrt((ac.x - 400) ** 2 + (ac.y - 400) ** 2) < 30) {
            landed.push(ac);
            return false;
          }
          return true;
        });

        landed.forEach(ac => {
          sfx.success();
          haptic(20);
          addMessage('system', 'SYSTEM', `${ac.callsign} — Safe landing. ${ac.emergency ? 'Emergency handled!' : ''}`);
          setScore(s => s + calculateScore(ac.emergency ? 'emergency_handled' : 'safe_landing', difficulty.id));
          setStats(s => ({
            ...s,
            landings: s.landings + 1,
            emergencies: s.emergencies + (ac.emergency ? 1 : 0),
          }));
        });

        const handedOff = [];
        const stillHere = remaining.filter(ac => {
          if (ac.handedOff) {
            handedOff.push(ac);
            return false;
          }
          return true;
        });

        handedOff.forEach(() => {
          setScore(s => s + calculateScore('safe_departure', difficulty.id));
          setStats(s => ({ ...s, departures: s.departures + 1 }));
        });

        const newConflicts = checkConflicts(stillHere);
        setConflicts(newConflicts);

        const criticalIds = newConflicts
          .filter(c => c.severity === 'CRITICAL')
          .map(c => c.id);
        const newCritical = criticalIds.filter(id => !prevCriticalRef.current.has(id));
        prevCriticalRef.current = new Set(criticalIds);

        if (newCritical.length > 0) {
          newCritical.forEach(() => {
            sfx.conflict();
            haptic([30, 40, 30]);
            showFeedback('near_miss', getInstructorFeedback('near_miss'));
            setScore(s => {
              const next = s + calculateScore('near_miss', difficulty.id);
              if (next <= MIN_SCORE) endGame('score');
              return next;
            });
            registerStrike();
          });
        }

        return stillHere;
      });
    }, 1000);

    return () => clearInterval(loop);
  }, [paused, gameOver, difficulty, addMessage, showFeedback, endGame, registerStrike]);

  useEffect(() => {
    if (paused || gameOver) return;

    setTimeout(() => spawnAircraft(), 1000);
    setTimeout(() => spawnAircraft(), 3000);

    const timer = setInterval(spawnAircraft, 8000 / difficulty.trafficMult);
    return () => clearInterval(timer);
  }, [paused, gameOver, spawnAircraft, difficulty]);

  useEffect(() => {
    if (difficulty.weatherMax === 0) return;
    const timer = setInterval(() => {
      const newWeather = getWeatherForDifficulty(difficulty);
      setWeather(newWeather);
      if (newWeather.severity > 2) {
        showFeedback('weather', getInstructorFeedback('weather'));
        addMessage('system', 'SYSTEM', `⚠ WEATHER UPDATE: ${newWeather.name} — Wind ${newWeather.wind.direction}° @ ${newWeather.wind.speed}KT${newWeather.wind.gusts ? ` G${newWeather.wind.gusts}` : ''}`);
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [difficulty, showFeedback, addMessage]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        setIsListening(prev => !prev);
      }
      if (e.code === 'KeyP') setPaused(prev => !prev);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    initAudio();
    const s = getSoundSettings();
    startAmbience();
    if (s.musicOn) startMusic();
    return () => {
      stopAmbience();
      stopMusic();
    };
  }, []);

  useEffect(() => {
    if (paused || gameOver) {
      stopMusic();
    } else if (getSoundSettings().musicOn) {
      startMusic();
    }
  }, [paused, gameOver]);

  useEffect(() => {
    if (!gameOver) return;
    sfx.gameOver();
    awardSessionXp(scoreRef.current, missionId);
  }, [gameOver, missionId]);

  const missionComplete = mission && score >= mission.scoreTarget;
  const shiftEnded = gameOverReason === 'complete';

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden relative">
      <div className="crt-overlay" />

      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/30 bg-card/30 relative z-[60]">
        <div className="flex items-center gap-3 min-w-0">
          <Radio className="w-4 h-4 text-primary shrink-0" />
          <span className="font-display text-xs text-primary text-glow tracking-wider shrink-0">YOUNEEK APEX CONTROL</span>
          <span className="font-mono text-[10px] text-muted-foreground truncate">{airport.id} — {airport.name}</span>
          {mission && (
            <span className="font-mono text-[9px] text-accent hidden md:inline truncate">
              MISSION: {mission.title} ({score}/{mission.scoreTarget} XP)
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {mission && missionComplete && !gameOver && (
            <Button
              size="sm"
              onClick={() => endGame('complete')}
              className="h-7 font-display text-[9px] tracking-wider bg-accent text-accent-foreground hover:bg-accent/80"
            >
              <Trophy className="w-3 h-3 mr-1" />
              END SHIFT
            </Button>
          )}
          <span className="font-mono text-[9px] text-destructive hidden sm:inline">
            STRIKES {strikes}/{MAX_STRIKES}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className="text-muted-foreground hover:text-primary h-7 w-7 p-0"
          >
            {ttsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPaused(!paused)}
            className="text-muted-foreground hover:text-primary h-7 w-7 p-0"
          >
            {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </Button>
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive h-7 w-7 p-0">
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {paused && !gameOver && (
        <div className="absolute inset-0 z-50 bg-background/80 flex items-center justify-center">
          <div className="text-center">
            <div className="font-display text-2xl text-primary text-glow tracking-wider mb-4">PAUSED</div>
            <Button onClick={() => setPaused(false)} variant="outline" className="font-display tracking-wider text-primary border-primary/30">
              RESUME
            </Button>
          </div>
        </div>
      )}

      {gameOver && (
        <div className="absolute inset-0 z-50 bg-background/90 flex items-center justify-center p-6">
          <div className="max-w-md w-full border border-border/40 rounded bg-card/95 p-6 text-center space-y-4">
            <div className={`font-display text-2xl tracking-wider ${shiftEnded ? 'text-primary text-glow' : 'text-destructive text-glow-red'}`}>
              {shiftEnded ? 'SHIFT COMPLETE' : 'SHIFT TERMINATED'}
            </div>
            <p className="font-mono text-xs text-muted-foreground">
              {shiftEnded && mission
                ? `Mission "${mission.title}" objectives met. +${mission.xpReward} bonus XP awarded.`
                : gameOverReason === 'strikes'
                  ? 'Too many separation losses. The FAA has some questions.'
                  : gameOverReason === 'score'
                    ? 'Your performance rating fell below minimum standards.'
                    : 'Your shift has ended.'}
            </p>

            <div className="grid grid-cols-2 gap-3 text-left">
              <StatBox label="Final Score" value={score.toLocaleString()} />
              <StatBox label="Shift Time" value={`${Math.floor(gameTime / 60)}:${String(gameTime % 60).padStart(2, '0')}`} />
              <StatBox label="Landings" value={stats.landings} />
              <StatBox label="Departures" value={stats.departures} />
              <StatBox label="Emergencies" value={stats.emergencies} />
              <StatBox label="Strikes" value={`${strikes}/${MAX_STRIKES}`} />
            </div>

            <div className="flex gap-3 justify-center pt-2">
              <Link to="/">
                <Button variant="outline" className="font-display tracking-wider text-xs border-primary/30 text-primary">
                  MAIN MENU
                </Button>
              </Link>
              <Link to={`/sim?airport=${airportId}&difficulty=${difficultyId}${missionId ? `&mission=${missionId}` : ''}`}>
                <Button className="font-display tracking-wider text-xs bg-primary text-primary-foreground hover:bg-primary/80">
                  TRY AGAIN
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {tutorialActive && !gameOver && (
        <TutorialOverlay
          stepIndex={tutorialStep}
          onAdvance={() => setTutorialStep(prev => prev + 1)}
          onSkip={skipTutorial}
        />
      )}

      <div className="flex-1 flex overflow-hidden relative z-10">
        <div className="w-56 border-r border-border/30 bg-card/20 p-2 flex flex-col gap-2 overflow-y-auto">
          <StatusPanel
            weather={weather}
            airport={airport}
            score={score}
            conflicts={conflicts}
            aircraft={aircraft}
            gameTime={gameTime}
            difficulty={difficulty}
          />
          {mission && (
            <div className="border border-accent/20 rounded bg-accent/5 p-2">
              <div className="font-mono text-[9px] text-accent uppercase tracking-wider mb-1">Career Objective</div>
              <div className="font-mono text-[10px] text-muted-foreground">{mission.description}</div>
              <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all"
                  style={{ width: `${Math.min(100, (score / mission.scoreTarget) * 100)}%` }}
                />
              </div>
              <div className="font-mono text-[9px] text-muted-foreground mt-1">
                {score} / {mission.scoreTarget} score
              </div>
            </div>
          )}
          <div className="h-px bg-border/20" />
          <div className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider mb-1">FLIGHT STRIPS</div>
          <FlightStrips
            aircraft={aircraft}
            selectedAircraft={selectedAircraft}
            onSelectAircraft={handleSelectAircraft}
          />
        </div>

        <div className="flex-1 flex items-center justify-center bg-[#020804] relative p-4">
          <RadarScope
            aircraft={aircraft}
            conflicts={conflicts}
            selectedAircraft={selectedAircraft}
            onSelectAircraft={handleSelectAircraft}
            weather={weather}
            sweepAngle={sweepAngle}
          />
        </div>

        <div className="w-64 border-l border-border/30 bg-card/20 p-2 flex flex-col gap-2">
          <InstructorPanel feedback={feedback} show={true} />

          <div className="flex-1 flex flex-col">
            <div className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider mb-1">COMM LOG</div>
            <div className="flex-1 overflow-hidden">
              <CommLog messages={messages} />
            </div>
          </div>

          <div className="h-px bg-border/20" />

          <VoiceControl
            onCommand={handleCommand}
            isListening={isListening}
            setIsListening={setIsListening}
            enabled={!paused && !gameOver}
          />

          <div className="h-px bg-border/20" />

          <div>
            <div className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider mb-1">TEXT COMMAND</div>
            <CommandInput onCommand={handleCommand} enabled={!paused && !gameOver} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="border border-border/30 rounded bg-card/50 p-2">
      <div className="font-mono text-[9px] text-muted-foreground uppercase">{label}</div>
      <div className="font-mono text-sm text-primary">{value}</div>
    </div>
  );
}
