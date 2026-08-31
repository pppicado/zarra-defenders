// game/state.js
//
// Session-level state per design D2 + design file changes §src/game/state.js:
//   - {score, lives, level, inMenu, paused, gameOver}
//   - Score persists across pause and across level retry (per combo-scoring
//     + game-over-flow specs).
//   - Lives reset per level.
//
// Exports a mutable `state` singleton plus small helpers. Game modules
// import this directly to avoid parameter passing through every call site.
//
// Per game-over-flow spec §No Persistent Save (v1), we DO NOT touch
// `localStorage`, IndexedDB, or any persistent storage. Session score
// lives in memory only and dies on reload.

export const state = {
  score: 0,                    // cumulative across all 5 levels
  lives: 3,                    // current level lives; reset on (re)start
  level: 0,                    // 0 = menu; 1..5 = active level
  inMenu: true,
  paused: false,
  gameOver: false,
  combo: 1,                    // current combo multiplier
  comboT: 0,                   // seconds since last successful hit
  hitsLanded: 0,               // for hito cadence tracking
  lastHitoScore: 0,            // last milestone at which HITO 1UP fired
  shieldT: 0,                  // seconds remaining of ALEGACION shield
  slowT: 0,                    // seconds remaining of MANIFESTACION slow
  alianzaT: 0,                 // seconds remaining of ALIANZA x2 pts
  pausedAt: 0,                 // timestamp captured at pause (for combo resume)
};

const INITIAL_LIVES = 3;

/**
 * Reset level-local state (lives, combo, timers) before starting a level.
 * Score is preserved.
 */
export function resetLevelLocal() {
  state.lives = INITIAL_LIVES;
  state.combo = 1;
  state.comboT = 0;
  state.shieldT = 0;
  state.slowT = 0;
  state.alianzaT = 0;
  state.gameOver = false;
  state.paused = false;
}

/**
 * Reset the full session — used on "Volver al menu" + page reload implicit
 * reset (the module re-loads on reload anyway, but this is here for tests
 * and for explicit menu-return transitions).
 */
export function resetSession() {
  state.score = 0;
  state.lastHitoScore = 0;
  resetLevelLocal();
  state.level = 0;
  state.inMenu = true;
}

/**
 * Mark the start of a level (1..5). Resets level-local state.
 */
export function startLevel(n) {
  state.level = n;
  state.inMenu = false;
  resetLevelLocal();
}