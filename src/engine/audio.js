// engine/audio.js
//
// Single shared AudioContext + master GainNode + per-channel sub-gains.
// Per design D4 and D8:
//   - The context is created suspended; resume() must be called from the
//     first-click atomic gesture (A3) wired in main.js.
//   - Master GainNode + sfx/music GainNodes split volume responsibility:
//     hit-feedback owns the master gain and mute state; chiptune / SFX
//     route through their own sub-gains.

let audioCtx = null;
let masterGain = null;
let sfxGain = null;
let musicGain = null;

export function getAudioContext() {
  return audioCtx;
}

export function initAudio() {
  if (audioCtx) return audioCtx;
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) {
    throw new Error("engine/audio: Web Audio API not available");
  }
  audioCtx = new Ctor();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.8;
  masterGain.connect(audioCtx.destination);

  sfxGain = audioCtx.createGain();
  sfxGain.gain.value = 1.0;
  sfxGain.connect(masterGain);

  musicGain = audioCtx.createGain();
  musicGain.gain.value = 0.6;
  musicGain.connect(masterGain);

  return audioCtx;
}

/**
 * Resume the audio context. MUST be called from the first-click atomic
 * gesture (A3). Returns the same shape `requestLock` does so the caller
 * can present a unified error.
 */
export async function resumeAudio() {
  if (!audioCtx) initAudio();
  try {
    await audioCtx.resume();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e };
  }
}

// ----- Volume + mute (per hit-feedback spec §Master Volume + Mute) ------

export function setMasterVolume(v) {
  if (!masterGain) return;
  const clamped = Math.max(0, Math.min(1, v));
  masterGain.gain.setTargetAtTime(clamped, audioCtx.currentTime, 0.02);
  return clamped;
}

export function getMasterVolume() {
  if (!masterGain) return 0.8;
  return masterGain.gain.value;
}

let muted = false;
let preMuteVolume = 0.8;

export function setMuted(m) {
  muted = !!m;
  if (!masterGain) return muted;
  if (muted) {
    preMuteVolume = masterGain.gain.value;
    masterGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.02);
  } else {
    masterGain.gain.setTargetAtTime(preMuteVolume || 0.8, audioCtx.currentTime, 0.02);
  }
  return muted;
}

export function isMuted() { return muted; }

// ----- SFX synthesis (placeholder chiptune palette) -------------------

/**
 * Short 8-bit-style fire pulse.
 */
export function playFire() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = "square";
  o.frequency.setValueAtTime(880, t);
  o.frequency.exponentialRampToValueAtTime(160, t + 0.06);
  g.gain.setValueAtTime(0.25, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
  o.connect(g); g.connect(sfxGain);
  o.start(t); o.stop(t + 0.08);
}

/**
 * Impact — short white-noise burst with pitch down (per plan §7).
 */
export function playHit() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  // White-noise buffer
  const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.08, audioCtx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }
  const src = audioCtx.createBufferSource();
  src.buffer = buf;
  const g = audioCtx.createGain();
  g.gain.value = 0.35;
  src.connect(g); g.connect(sfxGain);
  src.start(t);
}

/**
 * Reload click — audibly distinct from fire (per ammo-system spec §Reload
 * Audio Plays Once Per Reload). One click, slightly longer than fire.
 */
export function playReload() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = "triangle";
  o.frequency.setValueAtTime(2200, t);
  o.frequency.exponentialRampToValueAtTime(800, t + 0.04);
  g.gain.setValueAtTime(0.25, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
  o.connect(g); g.connect(sfxGain);
  o.start(t); o.stop(t + 0.06);
}

/**
 * Power-up chime — ascending arpeggio (per plan §7).
 */
export function playPowerUp() {
  if (!audioCtx) return;
  const t0 = audioCtx.currentTime;
  const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
  notes.forEach((f, i) => {
    const t = t0 + i * 0.07;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = "square";
    o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.18, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    o.connect(g); g.connect(sfxGain);
    o.start(t); o.stop(t + 0.13);
  });
}

/**
 * Dato-screen entry beep — single soft tone (per data-screen spec).
 */
export function playBeep() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(660, t);
  g.gain.setValueAtTime(0.20, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
  o.connect(g); g.connect(sfxGain);
  o.start(t); o.stop(t + 0.2);
}

/**
 * Game-over descending melody (per plan §7). 5 descending notes.
 */
export function playGameOver() {
  if (!audioCtx) return;
  const t0 = audioCtx.currentTime;
  const notes = [523, 392, 311, 247, 196];
  notes.forEach((f, i) => {
    const t = t0 + i * 0.22;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.22, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.20);
    o.connect(g); g.connect(musicGain);
    o.start(t); o.stop(t + 0.21);
  });
}

/**
 * Boss entry redoble — percussive roll (per plan §7).
 */
export function playBossEntry() {
  if (!audioCtx) return;
  const t0 = audioCtx.currentTime;
  for (let i = 0; i < 16; i++) {
    const t = t0 + i * 0.06;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = "square";
    o.frequency.setValueAtTime(80 + (i % 4) * 20, t);
    g.gain.setValueAtTime(0.18, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    o.connect(g); g.connect(musicGain);
    o.start(t); o.stop(t + 0.06);
  }
}

// ----- Music loop ------------------------------------------------------
//
// Procedural composition in the style of Spanish folk guitar. Three
// layers — plucked bass, arpeggio mid, accent treble — built from FM
// synthesis + percussive envelopes so notes feel "picked" rather than
// electronic. A minor pentatonic (A C D E G) keeps it modal and folk-ish
// no matter what pattern plays.
//
// The full loop is ~40 s before any bar repeats; patterns are randomised
// inside the pentatonic scale so two playthroughs of the same level
// never sound identical. Volume is duckable via setMusicVolume.

let musicTimer = null;
let musicLookahead = null;
const scheduled = new Set();   // set of (bar, slot) tuples already scheduled

// A minor pentatonic across 2 octaves — Hz.
const SCALE = [
  220.00, 261.63, 293.66, 329.63, 392.00,   // A3 C4 D4 E4 G4
  440.00, 523.25, 587.33, 659.25, 783.99,   // A4 C5 D5 E5 G5
];
const SCALE_LOW = [110.00, 130.81, 146.83, 164.81, 196.00]; // A2..G2

// Three pattern banks. Each is an array of (noteIndex, slotInBar) where
// noteIndex is into SCALE/SCALE_LOW and slotInBar is 0..15 (16th notes
// in a 4/4 bar).
const PATTERNS = [
  // Pattern 0 — arpeggio + bass
  [
    [0, 0],  [2, 4],  [4, 8],  [2, 12],
    [0, 0],  [2, 6],  [3, 10], [1, 14],
  ],
  // Pattern 1 — call + response
  [
    [4, 0],  [6, 4],
    [2, 8],  [3, 12],
    [1, 4],  [2, 10],
  ],
  // Pattern 2 — walking bass + chord tones
  [
    [0, 0],  [2, 4],  [4, 8],  [3, 12],
    [1, 6],  [3, 10],
    [2, 2],  [4, 14],
  ],
];
const BASS_PATTERNS = [
  // Plucked bass: root on 1 and 3, fifth on 2 and 4. Each row MUST be
  // its own nested array or JS flattens everything into a single row.
  [[0, 0], [2, 8]],
  [[1, 0], [2, 8]],
  [[2, 0], [3, 8]],
  [[0, 0], [4, 8]],
];
const ACCENT_PATTERN = [
  // Occasional high accent (every other bar)
  [[7, 6]],
  [],
  [[8, 14]],
  [],
];

let currentPattern = 0;
let currentBassPattern = 0;
let currentAccentIndex = 0;

/**
 * Pluck a string-like tone via FM: a sine carrier modulated by another
 * sine at harmonic ratio, with a percussive envelope.
 */
function pluckNote(freq, t, duration, amp = 0.18) {
  // Carrier + modulator for FM bell-ish timbre.
  const carrier = audioCtx.createOscillator();
  const modulator = audioCtx.createOscillator();
  const modGain = audioCtx.createGain();
  const env = audioCtx.createGain();

  carrier.type = "sine";
  carrier.frequency.setValueAtTime(freq, t);
  modulator.type = "sine";
  modulator.frequency.setValueAtTime(freq * 2.71, t);  // inharmonic ratio
  modGain.gain.setValueAtTime(freq * 0.6, t);
  modGain.gain.exponentialRampToValueAtTime(0.01, t + duration * 0.8);
  modulator.connect(modGain);
  modGain.connect(carrier.frequency);

  // Plucked envelope: fast attack, exponential decay, ~0.5 s tail.
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(amp, t + 0.005);
  env.gain.exponentialRampToValueAtTime(0.001, t + duration);

  carrier.connect(env);
  env.connect(musicGain);
  carrier.start(t);
  modulator.start(t);
  carrier.stop(t + duration);
  modulator.stop(t + duration);
}

/**
 * Pluck a low bass note with a slightly longer body.
 */
function pluckBass(freq, t, duration, amp = 0.22) {
  const carrier = audioCtx.createOscillator();
  const modulator = audioCtx.createOscillator();
  const modGain = audioCtx.createGain();
  const env = audioCtx.createGain();
  const lowpass = audioCtx.createBiquadFilter();

  carrier.type = "sine";
  carrier.frequency.setValueAtTime(freq, t);
  modulator.type = "sine";
  modulator.frequency.setValueAtTime(freq * 1.5, t);
  modGain.gain.setValueAtTime(freq * 0.4, t);
  modGain.gain.exponentialRampToValueAtTime(0.01, t + duration * 0.7);
  modulator.connect(modGain);
  modGain.connect(carrier.frequency);

  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(amp, t + 0.008);
  env.gain.exponentialRampToValueAtTime(0.001, t + duration);

  // Soft lowpass so the bass doesn't clash with the SFX.
  lowpass.type = "lowpass";
  lowpass.frequency.setValueAtTime(800, t);

  carrier.connect(env);
  env.connect(lowpass);
  lowpass.connect(musicGain);
  carrier.start(t);
  modulator.start(t);
  carrier.stop(t + duration);
  modulator.stop(t + duration);
}

function scheduleBar(barStartTime, barIndex) {
  const bpm = 88;
  const step = 60 / bpm / 4;   // 16th notes
  const barLen = step * 16;

  // Pick the next pattern (rotate, with occasional random jump).
  if (barIndex > 0 && barIndex % 4 === 0 && Math.random() < 0.3) {
    currentPattern = (currentPattern + 1 + Math.floor(Math.random() * (PATTERNS.length - 1))) % PATTERNS.length;
    currentBassPattern = (currentBassPattern + 1 + Math.floor(Math.random() * (BASS_PATTERNS.length - 1))) % BASS_PATTERNS.length;
  }

  // Mid arpeggio.
  for (const [idx, slot] of PATTERNS[currentPattern]) {
    const t = barStartTime + slot * step;
    const freq = SCALE[idx];
    pluckNote(freq, t, step * 1.8, 0.14);
  }

  // Bass (slower, 8th note pulse on beats 1 and 3).
  for (const [idx, slot] of BASS_PATTERNS[currentBassPattern]) {
    const t = barStartTime + slot * step;
    const freq = SCALE_LOW[idx];
    pluckBass(freq, t, step * 2.5, 0.18);
  }

  // Accent (every other bar).
  const accents = ACCENT_PATTERN[currentAccentIndex % ACCENT_PATTERN.length];
  for (const [idx, slot] of accents) {
    const t = barStartTime + slot * step;
    const freq = SCALE[idx] * 2;  // octave up for sparkle
    pluckNote(freq, t, step * 2, 0.08);
  }
  currentAccentIndex++;
}

function scheduleLoop() {
  if (!audioCtx) return;
  const barLen = (60 / 88) * 4;          // seconds per bar at 88 BPM
  const lookahead = 2.0;                // seconds of audio we keep queued
  const interval = 0.5;                 // schedule every 0.5 s
  let nextBarTime = audioCtx.currentTime + 0.1;
  let barIndex = 0;

  function tick() {
    const horizon = audioCtx.currentTime + lookahead;
    while (nextBarTime < horizon) {
      const key = `bar-${barIndex}`;
      if (!scheduled.has(key)) {
        scheduleBar(nextBarTime, barIndex);
        scheduled.add(key);
      }
      nextBarTime += barLen;
      barIndex++;
    }
  }

  tick();
  musicTimer = setInterval(tick, interval * 1000);
}

export function startMusic() {
  if (!audioCtx) return;
  if (musicTimer) return;
  scheduled.clear();
  currentPattern = 0;
  currentBassPattern = 0;
  currentAccentIndex = 0;
  scheduleLoop();
}

export function stopMusic() {
  if (musicTimer) {
    clearInterval(musicTimer);
    musicTimer = null;
  }
}

export function setMusicVolume(v) {
  if (!musicGain) return;
  musicGain.gain.setTargetAtTime(Math.max(0, Math.min(1, v)), audioCtx.currentTime, 0.02);
}