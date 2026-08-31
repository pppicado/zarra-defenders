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
// Minimal chiptune: a square-wave bass + lead melody that loops every 4 s.
// Tempo per design is not encoded in spec — the 4 s loop matches a casual
// ~120 BPM feel suitable for an event venue (R12 mitigation). Volume is
// duckable via `setMusicVolume`.

let musicNodes = [];
let musicTimer = null;

export function startMusic() {
  if (!audioCtx) return;
  if (musicTimer) return;
  const bpm = 120;
  const step = 60 / bpm / 2;     // 8th notes
  const notes = [262, 330, 392, 330, 294, 262, 392, 330];

  function scheduleBar() {
    const t0 = audioCtx.currentTime + 0.05;
    for (let i = 0; i < notes.length; i++) {
      const t = t0 + i * step;
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = "square";
      o.frequency.setValueAtTime(notes[i], t);
      g.gain.setValueAtTime(0.12, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + step * 0.7);
      o.connect(g); g.connect(musicGain);
      o.start(t); o.stop(t + step * 0.8);

      // Bass
      const o2 = audioCtx.createOscillator();
      const g2 = audioCtx.createGain();
      o2.type = "triangle";
      o2.frequency.setValueAtTime(notes[i] / 2, t);
      g2.gain.setValueAtTime(0.10, t);
      g2.gain.exponentialRampToValueAtTime(0.001, t + step * 0.9);
      o2.connect(g2); g2.connect(musicGain);
      o2.start(t); o2.stop(t + step);
    }
    musicNodes = [];            // nodes are GC'd after stop; no leak
  }

  scheduleBar();
  musicTimer = setInterval(scheduleBar, step * notes.length * 1000);
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