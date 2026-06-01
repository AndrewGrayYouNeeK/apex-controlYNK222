// Procedural sound engine using Web Audio API.
// No external audio files — all sounds are synthesized, so they work offline and on iOS.

let ctx = null;
let masterGain = null;
let musicGain = null;
let sfxGain = null;
let ambienceNodes = null;
let musicNodes = null;

let settings = {
  sfxOn: true,
  musicOn: true,
  sfxVolume: 0.7,
  musicVolume: 0.35,
};

function ensureContext() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    masterGain = ctx.createGain();
    masterGain.gain.value = 1;
    masterGain.connect(ctx.destination);

    sfxGain = ctx.createGain();
    sfxGain.gain.value = settings.sfxVolume;
    sfxGain.connect(masterGain);

    musicGain = ctx.createGain();
    musicGain.gain.value = settings.musicVolume;
    musicGain.connect(masterGain);
  }
  // iOS/Safari require resume after a user gesture.
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// Call once on first user interaction (e.g. tapping a menu button).
export function initAudio() {
  ensureContext();
}

export function setSoundSettings(next) {
  settings = { ...settings, ...next };
  if (sfxGain) sfxGain.gain.value = settings.sfxOn ? settings.sfxVolume : 0;
  if (musicGain) musicGain.gain.value = settings.musicOn ? settings.musicVolume : 0;
  if (!settings.musicOn) stopMusic();
}

export function getSoundSettings() {
  return { ...settings };
}

// --- Basic synth helpers ---

function tone({ freq = 440, dur = 0.15, type = 'sine', gain = 0.4, attack = 0.005, release = 0.08, dest = null }) {
  const c = ensureContext();
  if (!c || !settings.sfxOn) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const now = c.currentTime;
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(gain, now + attack);
  g.gain.linearRampToValueAtTime(0, now + dur + release);
  osc.connect(g);
  g.connect(dest || sfxGain);
  osc.start(now);
  osc.stop(now + dur + release + 0.02);
}

function noiseBurst({ dur = 0.2, gain = 0.25, filterFreq = 1200, dest = null }) {
  const c = ensureContext();
  if (!c || !settings.sfxOn) return;
  const bufferSize = Math.floor(c.sampleRate * dur);
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = filterFreq;
  const g = c.createGain();
  g.gain.value = gain;
  src.connect(filter);
  filter.connect(g);
  g.connect(dest || sfxGain);
  src.start();
}

// --- Game SFX ---

export const sfx = {
  click() {
    tone({ freq: 660, dur: 0.04, type: 'square', gain: 0.15 });
  },
  select() {
    tone({ freq: 880, dur: 0.06, type: 'sine', gain: 0.2 });
    tone({ freq: 1320, dur: 0.05, type: 'sine', gain: 0.12 });
  },
  command() {
    tone({ freq: 520, dur: 0.05, type: 'triangle', gain: 0.18 });
  },
  // Radio "kerchunk" — squelch open + static + squelch close.
  radioStart() {
    noiseBurst({ dur: 0.06, gain: 0.18, filterFreq: 1800 });
  },
  radioEnd() {
    noiseBurst({ dur: 0.05, gain: 0.14, filterFreq: 900 });
  },
  success() {
    tone({ freq: 523, dur: 0.1, type: 'sine', gain: 0.25 });
    setTimeout(() => tone({ freq: 784, dur: 0.14, type: 'sine', gain: 0.25 }), 90);
  },
  alert() {
    tone({ freq: 880, dur: 0.12, type: 'square', gain: 0.22 });
    setTimeout(() => tone({ freq: 880, dur: 0.12, type: 'square', gain: 0.22 }), 160);
  },
  emergency() {
    tone({ freq: 740, dur: 0.18, type: 'sawtooth', gain: 0.28 });
    setTimeout(() => tone({ freq: 580, dur: 0.22, type: 'sawtooth', gain: 0.28 }), 200);
  },
  conflict() {
    tone({ freq: 1000, dur: 0.08, type: 'square', gain: 0.25 });
    setTimeout(() => tone({ freq: 1200, dur: 0.08, type: 'square', gain: 0.25 }), 100);
    setTimeout(() => tone({ freq: 1000, dur: 0.08, type: 'square', gain: 0.25 }), 200);
  },
  gameOver() {
    tone({ freq: 392, dur: 0.2, type: 'sine', gain: 0.3 });
    setTimeout(() => tone({ freq: 311, dur: 0.3, type: 'sine', gain: 0.3 }), 180);
    setTimeout(() => tone({ freq: 233, dur: 0.5, type: 'sine', gain: 0.3 }), 380);
  },
};

// --- Background airport ambience (low engine hum + filtered noise) ---

export function startAmbience() {
  const c = ensureContext();
  if (!c || ambienceNodes) return;
  const hum = c.createOscillator();
  hum.type = 'sawtooth';
  hum.frequency.value = 55;
  const humGain = c.createGain();
  humGain.gain.value = 0.04;
  const humFilter = c.createBiquadFilter();
  humFilter.type = 'lowpass';
  humFilter.frequency.value = 200;
  hum.connect(humFilter);
  humFilter.connect(humGain);
  humGain.connect(sfxGain);
  hum.start();
  ambienceNodes = { hum, humGain };
}

export function stopAmbience() {
  if (!ambienceNodes) return;
  try { ambienceNodes.hum.stop(); } catch (e) { /* already stopped */ }
  ambienceNodes = null;
}

// --- Background music (simple ambient arpeggio loop) ---

export function startMusic() {
  const c = ensureContext();
  if (!c || !settings.musicOn || musicNodes) return;
  const notes = [220, 261.63, 329.63, 392, 329.63, 261.63];
  let idx = 0;
  const interval = setInterval(() => {
    if (!settings.musicOn) return;
    const f = notes[idx % notes.length];
    tone({ freq: f, dur: 0.6, type: 'sine', gain: 0.12, attack: 0.1, release: 0.4, dest: musicGain });
    tone({ freq: f / 2, dur: 0.8, type: 'triangle', gain: 0.06, attack: 0.1, release: 0.5, dest: musicGain });
    idx++;
  }, 700);
  musicNodes = { interval };
}

export function stopMusic() {
  if (!musicNodes) return;
  clearInterval(musicNodes.interval);
  musicNodes = null;
}

// Light haptic helper (works on supported mobile browsers).
export function haptic(ms = 10) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(ms);
}