import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AIRPORTS, DIFFICULTY_LEVELS } from '@/lib/gameData';
import {
  createAircraft, updateAircraft, checkConflicts, generateEmergency,
  getWeatherForDifficulty, getInstructorFeedback, parseVoiceCommand,
  generateReadback, applyCommands, calculateScore
} from '@/lib/gameEngine';
import RadarScope from '@/components/atc/RadarScope';
import FlightStrips from '@/components/atc/FlightStrips';
import StatusPanel from '@/components/atc/StatusPanel';
import CommLog from '@/components/atc/CommLog';
import VoiceControl from '@/components/atc/VoiceControl';
import InstructorPanel from '@/components/atc/InstructorPanel';
import CommandInput from '@/components/atc/CommandInput';
import TutorialOverlay, { TUTORIAL_STEPS } from '@/components/atc/TutorialOverlay';
import { Radio, Pause, Play, LogOut, Volume2, VolumeX } from 'lucide-react';
import { initAudio, startAmbience, stopAmbience, startMusic, stopMusic, sfx, haptic, getSoundSettings } from '@/lib/soundEngine';

export default function Simulator() {
  const urlParams = new URLSearchParams(window.location.search);
  const airportId = urlParams.get('airport') || 'KOSH';
  const difficultyId = urlParams.get('difficulty') || 'tutorial';

  const airport = AIRPORTS.find(a => a.id === airportId) || AIRPORTS[0];
  const difficulty = DIFFICULTY_LEVELS.find(d => d.id === difficultyId) || DIFFICULTY_LEVELS[0];

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

  // Guided tutorial — only active on the tutorial difficulty
  const [tutorialStep, setTutorialStep] = useState(difficultyId === 'tutorial' ? 0 : -1);
  const tutorialActive = tutorialStep >= 0 && tutorialStep < TUTORIAL_STEPS.length;
  const tutorialStepRef = useRef(tutorialStep);
  tutorialStepRef.current = tutorialStep;

  const advanceTutorial = useCallback((fromStepId) => {
    setTutorialStep(prev => {
      if (prev < 0) return prev;
      // If a specific step is expected, only advance from that step
      if (fromStepId && TUTORIAL_STEPS[prev]?.id !== fromStepId) return prev;
      return prev + 1;
    });
  }, []);

  const skipTutorial = useCallback(() => setTutorialStep(-1), []);

  // Selecting an aircraft advances the "select" tutorial step
  const handleSelectAircraft = useCallback((id) => {
    setSelectedAircraft(id);
    if (id) advanceTutorial('select');
  }, [advanceTutorial]);

  const aircraftRef = useRef(aircraft);
  const scoreRef = useRef(score);
  const gameLoopRef = useRef(null);
  const spawnTimerRef = useRef(null);
  const lastUpdateRef = useRef(Date.now());

  aircraftRef.current = aircraft;
  scoreRef.current = score;

  // Add message to comm log
  const addMessage = useCallback((type, sender, text) => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    setMessages(prev => [...prev.slice(-50), { type, sender, text, time }]);
  }, []);

  // Text-to-speech for pilot readbacks
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

  // Show instructor feedback
  const showFeedback = useCallback((type, text) => {
    setFeedback({ type, text });
    addMessage('instructor', 'INSTRUCTOR', text);
    setTimeout(() => setFeedback(null), 5000);
  }, [addMessage]);

  // Handle voice/text command
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

    // Generate readback
    const readback = generateReadback(parsed, ac);
    sfx.radioStart();
    sfx.command();
    haptic(8);
    addMessage('pilot', ac.callsign, readback);
    speak(readback);
    setTimeout(() => sfx.radioEnd(), 250);

    // Apply commands
    setAircraft(prev => prev.map(a => {
      if (a.id === parsed.callsign) {
        return applyCommands({ ...a }, parsed.commands);
      }
      return a;
    }));

    // Good feedback
    setScore(prev => prev + calculateScore('good_separation', difficulty.id));
    if (Math.random() > 0.7) {
      showFeedback('good', getInstructorFeedback('good'));
    }

    // Advance the guided tutorial based on the command type issued
    const types = parsed.commands.map(c => c.type);
    const curStep = TUTORIAL_STEPS[tutorialStepRef.current];
    if (curStep) {
      if (curStep.id === 'heading' && types.includes('heading')) advanceTutorial('heading');
      else if (curStep.id === 'altitude' && types.includes('altitude')) advanceTutorial('altitude');
      else if (curStep.id === 'land' && types.includes('cleared_approach')) advanceTutorial('land');
    }
  }, [addMessage, speak, showFeedback, difficulty, advanceTutorial]);

  // Spawn new aircraft
  const spawnAircraft = useCallback(() => {
    if (paused || gameOver) return;
    const maxTraffic = Math.max(3, Math.round(airport.trafficDensity * difficulty.trafficMult));
    if (aircraftRef.current.length >= maxTraffic) return;

    const type = Math.random() > 0.4 ? 'arrival' : 'departure';
    const newAc = createAircraft(airport, type);
    setAircraft(prev => [...prev, newAc]);
    addMessage('pilot', newAc.callsign, `${airport.id} ${type === 'arrival' ? 'Approach' : 'Tower'}, ${newAc.spoken}, ${newAc.aircraft.type}, ${type === 'arrival' ? `inbound from the ${['north', 'south', 'east', 'west'][Math.floor(Math.random() * 4)]}, altitude ${Math.floor(newAc.altitude / 1000)} thousand` : 'ready for departure'}.`);
    speak(`${airport.id} ${type === 'arrival' ? 'Approach' : 'Tower'}, ${newAc.spoken}`);

    // Maybe generate emergency
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

  // Game loop
  useEffect(() => {
    if (paused || gameOver) return;

    const loop = setInterval(() => {
      const now = Date.now();
      const delta = now - lastUpdateRef.current;
      lastUpdateRef.current = now;

      // Update sweep angle
      setSweepAngle(prev => (prev + (360 / 4000) * delta) % 360);

      // Update game time
      setGameTime(prev => prev + 1);

      // Update aircraft positions
      setAircraft(prev => {
        const updated = prev.map(ac => updateAircraft({ ...ac }, delta)).filter(ac => !ac.offScreen);

        // Check for landed aircraft (close to center and low altitude on approach)
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
          setScore(prev => prev + calculateScore(ac.emergency ? 'emergency_handled' : 'safe_landing', difficulty.id));
        });

        // Check departed
        const handedOff = [];
        const stillHere = remaining.filter(ac => {
          if (ac.handedOff) {
            handedOff.push(ac);
            return false;
          }
          return true;
        });

        handedOff.forEach(ac => {
          setScore(prev => prev + calculateScore('safe_departure', difficulty.id));
        });

        // Check conflicts
        const newConflicts = checkConflicts(stillHere);
        setConflicts(newConflicts);

        if (newConflicts.length > 0) {
          newConflicts.forEach(c => {
            if (c.severity === 'CRITICAL') {
              sfx.conflict();
              haptic([30, 40, 30]);
              showFeedback('near_miss', getInstructorFeedback('near_miss'));
              setScore(prev => prev + calculateScore('near_miss', difficulty.id));
            }
          });
        }

        return stillHere;
      });
    }, 1000);

    gameLoopRef.current = loop;
    return () => clearInterval(loop);
  }, [paused, gameOver, difficulty, addMessage, showFeedback]);

  // Spawn timer
  useEffect(() => {
    if (paused || gameOver) return;

    // Initial spawn
    setTimeout(() => spawnAircraft(), 1000);
    setTimeout(() => spawnAircraft(), 3000);

    const timer = setInterval(spawnAircraft, 8000 / difficulty.trafficMult);
    spawnTimerRef.current = timer;
    return () => clearInterval(timer);
  }, [paused, gameOver, spawnAircraft, difficulty]);

  // Weather changes
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

  // Keyboard: space for PTT
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


  // Start audio (ambience + music) on mount; respects saved sound settings
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

  // Pause/resume ambience + music with the game
  useEffect(() => {
    if (paused || gameOver) {
      stopMusic();
    } else if (getSoundSettings().musicOn) {
      startMusic();
    }
  }, [paused, gameOver]);

  // Save career progress
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('atc_career') || '{}');
    saved.xp = (saved.xp || 0) + Math.max(0, score);
    saved.lastAirport = airportId;
    saved.lastDifficulty = difficultyId;
    localStorage.setItem('atc_career', JSON.stringify(saved));
  }, [score, airportId, difficultyId]);

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden relative">
      <div className="crt-overlay" />

      {/* Top bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/30 bg-card/30 relative z-[60]">
        <div className="flex items-center gap-3">
          <Radio className="w-4 h-4 text-primary" />
          <span className="font-display text-xs text-primary text-glow tracking-wider">YOUNEEK APEX CONTROL</span>
          <span className="font-mono text-[10px] text-muted-foreground">{airport.id} — {airport.name}</span>
        </div>
        <div className="flex items-center gap-2">
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

      {/* Paused overlay */}
      {paused && (
        <div className="absolute inset-0 z-50 bg-background/80 flex items-center justify-center">
          <div className="text-center">
            <div className="font-display text-2xl text-primary text-glow tracking-wider mb-4">PAUSED</div>
            <Button onClick={() => setPaused(false)} variant="outline" className="font-display tracking-wider text-primary border-primary/30">
              RESUME
            </Button>
          </div>
        </div>
      )}

      {/* Guided tutorial overlay */}
      {tutorialActive && (
        <TutorialOverlay
          stepIndex={tutorialStep}
          onAdvance={() => setTutorialStep(prev => prev + 1)}
          onSkip={skipTutorial}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Left panel - Status & Flight Strips */}
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
          <div className="h-px bg-border/20" />
          <div className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider mb-1">FLIGHT STRIPS</div>
          <FlightStrips
            aircraft={aircraft}
            selectedAircraft={selectedAircraft}
            onSelectAircraft={handleSelectAircraft}
          />
        </div>

        {/* Center - Radar */}
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

        {/* Right panel - Comms */}
        <div className="w-64 border-l border-border/30 bg-card/20 p-2 flex flex-col gap-2">
          {/* Instructor */}
          <InstructorPanel feedback={feedback} show={true} />

          {/* Comm log */}
          <div className="flex-1 flex flex-col">
            <div className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider mb-1">COMM LOG</div>
            <div className="flex-1 overflow-hidden">
              <CommLog messages={messages} />
            </div>
          </div>

          <div className="h-px bg-border/20" />

          {/* Voice Control */}
          <VoiceControl
            onCommand={handleCommand}
            isListening={isListening}
            setIsListening={setIsListening}
            enabled={!paused && !gameOver}
          />

          <div className="h-px bg-border/20" />

          {/* Text command fallback */}
          <div>
            <div className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider mb-1">TEXT COMMAND</div>
            <CommandInput onCommand={handleCommand} enabled={!paused && !gameOver} />
          </div>
        </div>
      </div>
    </div>
  );
}