import { generateCallsign, generateAircraft, EMERGENCY_TYPES, WEATHER_PRESETS, INSTRUCTOR_LINES } from './gameData';

// Normalize heading to 0-360
function normalizeHeading(h) {
  return ((h % 360) + 360) % 360;
}

// Calculate distance between two points
function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// Convert heading to radians
function headingToRad(heading) {
  return ((90 - heading) * Math.PI) / 180;
}

// Create a new aircraft
export function createAircraft(airport, type = 'arrival') {
  const cs = generateCallsign();
  const ac = generateAircraft(airport.difficulty);
  const centerX = 400;
  const centerY = 400;
  const radarRadius = 350;

  let x, y, heading, altitude, speed;

  if (type === 'arrival') {
    const angle = Math.random() * Math.PI * 2;
    x = centerX + Math.cos(angle) * radarRadius;
    y = centerY + Math.sin(angle) * radarRadius;
    heading = normalizeHeading(Math.atan2(centerY - y, centerX - x) * 180 / Math.PI + 90 + (Math.random() - 0.5) * 40);
    altitude = Math.floor((Math.random() * 15 + 10) * 1000);
    speed = ac.speed;
  } else {
    const rwy = airport.runways[Math.floor(Math.random() * airport.runways.length)];
    x = centerX + (Math.random() - 0.5) * 20;
    y = centerY + (Math.random() - 0.5) * 20;
    heading = rwy.heading;
    altitude = 1000 + Math.floor(Math.random() * 3) * 1000;
    speed = ac.speed * 0.7;
  }

  return {
    id: `${cs.flightNumber}-${Date.now()}`,
    callsign: cs.flightNumber,
    spoken: cs.spoken,
    airline: cs.airline,
    aircraft: ac,
    x,
    y,
    heading,
    targetHeading: heading,
    altitude,
    targetAltitude: altitude,
    speed,
    targetSpeed: speed,
    type,
    status: type === 'arrival' ? 'INBOUND' : 'DEPARTING',
    emergency: null,
    squawk: '1200',
    cleared: false,
    onFrequency: true,
    trail: [],
    lastUpdate: Date.now(),
    handedOff: false,
    goAround: false,
    instructions: [],
  };
}

// Update aircraft position
export function updateAircraft(ac, deltaTime) {
  const turnRate = 3; // degrees per second
  const climbRate = ac.aircraft.climbRate;
  const speedChangeRate = 5; // knots per second
  const dt = deltaTime / 1000;

  // Turn towards target heading
  const headingDiff = normalizeHeading(ac.targetHeading - ac.heading);
  if (headingDiff > 1 && headingDiff < 359) {
    const turnDir = headingDiff > 180 ? -1 : 1;
    const turnAmount = Math.min(turnRate * dt, Math.abs(headingDiff > 180 ? 360 - headingDiff : headingDiff));
    ac.heading = normalizeHeading(ac.heading + turnDir * turnAmount);
  }

  // Climb/descend
  if (Math.abs(ac.altitude - ac.targetAltitude) > 50) {
    const dir = ac.targetAltitude > ac.altitude ? 1 : -1;
    ac.altitude += dir * climbRate * dt;
    if ((dir > 0 && ac.altitude > ac.targetAltitude) || (dir < 0 && ac.altitude < ac.targetAltitude)) {
      ac.altitude = ac.targetAltitude;
    }
  }

  // Speed change
  if (Math.abs(ac.speed - ac.targetSpeed) > 2) {
    const dir = ac.targetSpeed > ac.speed ? 1 : -1;
    ac.speed += dir * speedChangeRate * dt;
  }

  // Move based on heading and speed
  const speedScale = ac.speed / 3000; // scale for radar
  const rad = headingToRad(ac.heading);
  ac.x += Math.cos(rad) * speedScale * dt * 60;
  ac.y -= Math.sin(rad) * speedScale * dt * 60;

  // Store trail
  if (!ac._trailTimer || Date.now() - ac._trailTimer > 2000) {
    ac.trail.push({ x: ac.x, y: ac.y, time: Date.now() });
    if (ac.trail.length > 8) ac.trail.shift();
    ac._trailTimer = Date.now();
  }

  // Check if aircraft has left radar range
  const dist = distance(ac.x, ac.y, 400, 400);
  if (dist > 420 && ac.type === 'departure' && ac.status !== 'CONFLICT') {
    ac.handedOff = true;
  }
  if (dist > 500) {
    ac.offScreen = true;
  }

  return ac;
}

// Check for conflicts between aircraft
export function checkConflicts(aircraft) {
  const conflicts = [];
  const LATERAL_MIN = 30; // radar pixels (~3nm)
  const VERTICAL_MIN = 1000; // feet

  for (let i = 0; i < aircraft.length; i++) {
    for (let j = i + 1; j < aircraft.length; j++) {
      const a = aircraft[i];
      const b = aircraft[j];
      const dist = distance(a.x, a.y, b.x, b.y);
      const vertSep = Math.abs(a.altitude - b.altitude);

      if (dist < LATERAL_MIN && vertSep < VERTICAL_MIN) {
        conflicts.push({
          id: `${a.id}-${b.id}`,
          aircraft1: a,
          aircraft2: b,
          distance: dist,
          verticalSep: vertSep,
          severity: dist < LATERAL_MIN / 2 ? 'CRITICAL' : 'WARNING',
        });
      }
    }
  }
  return conflicts;
}

// Generate random emergency
export function generateEmergency(aircraft, difficultyLevel) {
  if (aircraft.length === 0) return null;
  if (Math.random() > difficultyLevel.emergencyChance) return null;

  const ac = aircraft[Math.floor(Math.random() * aircraft.length)];
  if (ac.emergency) return null;

  const maxSeverity = difficultyLevel.id === 'insane' ? EMERGENCY_TYPES.length : Math.min(EMERGENCY_TYPES.length, 6);
  const emergency = EMERGENCY_TYPES[Math.floor(Math.random() * maxSeverity)];

  ac.emergency = emergency;
  ac.squawk = emergency.squawk;

  return { aircraft: ac, emergency };
}

// Get weather for difficulty
export function getWeatherForDifficulty(difficultyLevel) {
  const maxIdx = WEATHER_PRESETS.findIndex(w => w.severity > difficultyLevel.weatherMax);
  const available = maxIdx === -1 ? WEATHER_PRESETS : WEATHER_PRESETS.slice(0, maxIdx);
  return available[Math.floor(Math.random() * available.length)];
}

// Get instructor feedback
export function getInstructorFeedback(type) {
  const lines = INSTRUCTOR_LINES[type];
  if (!lines) return '';
  return lines[Math.floor(Math.random() * lines.length)];
}

// Parse voice command
export function parseVoiceCommand(transcript, aircraft) {
  const text = transcript.toLowerCase().trim();
  const result = { callsign: null, commands: [], raw: text, valid: false };

  // Try to match callsign
  for (const ac of aircraft) {
    const spoken = ac.spoken.toLowerCase();
    const cs = ac.callsign.toLowerCase();
    if (text.includes(spoken) || text.includes(cs) || text.includes(cs.replace(/(\D+)(\d+)/, '$1 $2'))) {
      result.callsign = ac.id;
      result.valid = true;
      break;
    }
  }

  // Parse heading commands
  const headingMatch = text.match(/(?:turn\s+(?:left|right)\s+)?heading\s+(\w+)/i) ||
    text.match(/(?:fly|turn)\s+heading\s+(\w+)/i);
  if (headingMatch) {
    const hdg = parseSpokenNumber(headingMatch[1]);
    if (hdg !== null) result.commands.push({ type: 'heading', value: hdg });
  }

  // Parse turn left/right
  const turnMatch = text.match(/turn\s+(left|right)\s+heading\s+(\w+)/i);
  if (turnMatch) {
    const hdg = parseSpokenNumber(turnMatch[2]);
    if (hdg !== null) result.commands.push({ type: 'heading', value: hdg, direction: turnMatch[1] });
  }

  // Parse altitude commands
  const altMatch = text.match(/(?:climb|descend)\s+(?:and\s+)?maintain\s+(\w[\w\s]*?)(?:\s|$)/i) ||
    text.match(/altitude\s+(\w[\w\s]*?)(?:\s|$)/i);
  if (altMatch) {
    const alt = parseAltitude(altMatch[1]);
    if (alt !== null) result.commands.push({ type: 'altitude', value: alt });
  }

  // Parse speed commands
  const speedMatch = text.match(/(?:reduce|increase)\s+speed\s+(?:to\s+)?(\w+)/i) ||
    text.match(/maintain\s+(\w+)\s+knots/i);
  if (speedMatch) {
    const spd = parseSpokenNumber(speedMatch[1]);
    if (spd !== null) result.commands.push({ type: 'speed', value: spd });
  }

  // Cleared approaches
  if (text.includes('cleared') && (text.includes('ils') || text.includes('visual') || text.includes('approach'))) {
    result.commands.push({ type: 'cleared_approach' });
  }

  // Cleared for takeoff
  if (text.includes('cleared') && (text.includes('takeoff') || text.includes('take off'))) {
    result.commands.push({ type: 'cleared_takeoff' });
  }

  // Go around
  if (text.includes('go around') || text.includes('go-around')) {
    result.commands.push({ type: 'go_around' });
  }

  // Hold
  if (text.includes('hold') && !text.includes('hold short')) {
    result.commands.push({ type: 'hold' });
  }

  return result;
}

function parseSpokenNumber(str) {
  const words = {
    'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4,
    'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'niner': 9, 'nine': 9,
  };
  let result = '';
  const parts = str.trim().split(/[\s-]+/);
  for (const p of parts) {
    if (words[p] !== undefined) result += words[p];
    else if (/^\d+$/.test(p)) result += p;
    else break;
  }
  return result ? parseInt(result) : null;
}

function parseAltitude(str) {
  const num = parseSpokenNumber(str);
  if (num !== null) {
    if (num < 100) return num * 1000;
    return num * (num < 500 ? 100 : 1);
  }
  const thousandMatch = str.match(/(\d+)\s*thousand/);
  if (thousandMatch) return parseInt(thousandMatch[1]) * 1000;
  return null;
}

// Generate pilot readback
export function generateReadback(command, aircraft) {
  const parts = [];
  for (const cmd of command.commands) {
    switch (cmd.type) {
      case 'heading':
        parts.push(`turning ${cmd.direction || ''} heading ${String(cmd.value).padStart(3, '0')}`);
        break;
      case 'altitude':
        if (cmd.value >= aircraft.altitude) parts.push(`climbing to ${formatAltitude(cmd.value)}`);
        else parts.push(`descending to ${formatAltitude(cmd.value)}`);
        break;
      case 'speed':
        parts.push(`speed ${cmd.value}`);
        break;
      case 'cleared_approach':
        parts.push('cleared for the approach');
        break;
      case 'cleared_takeoff':
        parts.push('cleared for takeoff');
        break;
      case 'go_around':
        parts.push('going around');
        break;
      case 'hold':
        parts.push('holding as directed');
        break;
    }
  }
  return `${aircraft.spoken}, ${parts.join(', ')}, roger.`;
}

function formatAltitude(alt) {
  if (alt >= 18000) return `flight level ${Math.floor(alt / 100)}`;
  if (alt >= 1000) return `${Math.floor(alt / 1000)} thousand`;
  return `${alt} feet`;
}

// Apply parsed commands to aircraft
export function applyCommands(aircraft, commands) {
  for (const cmd of commands) {
    switch (cmd.type) {
      case 'heading':
        aircraft.targetHeading = cmd.value;
        break;
      case 'altitude':
        aircraft.targetAltitude = cmd.value;
        break;
      case 'speed':
        aircraft.targetSpeed = cmd.value;
        break;
      case 'cleared_approach':
        aircraft.cleared = true;
        aircraft.status = 'APPROACH';
        aircraft.targetAltitude = 3000;
        break;
      case 'cleared_takeoff':
        aircraft.status = 'DEPARTING';
        aircraft.targetAltitude = 5000;
        break;
      case 'go_around':
        aircraft.goAround = true;
        aircraft.targetAltitude = 3000;
        aircraft.cleared = false;
        aircraft.status = 'GO AROUND';
        break;
    }
  }
  return aircraft;
}

// Calculate score for actions
export function calculateScore(action, difficulty) {
  const multiplier = { tutorial: 0.5, beginner: 1, medium: 1.5, hard: 2, expert: 3, insane: 5 };
  const base = {
    safe_landing: 100,
    safe_departure: 50,
    conflict_resolved: 200,
    emergency_handled: 500,
    good_separation: 25,
    near_miss: -500,
    conflict: -1000,
  };
  return Math.floor((base[action] || 0) * (multiplier[difficulty] || 1));
}