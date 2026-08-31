// game/data-screen.js
//
// Data-screen + final-screen renderer module. In v1 the data-screen
// logic lives in pedagogy.js; this file is a thin facade that ensures
// the `data-screen` capability has a one-module home (per design D2:
// one module per spec). Re-exporting from pedagogy.js keeps the
// spec/module mapping 1:1.

export { showDatoScreen, showFinalScreen, showCredits, showDatoOverlay } from "./pedagogy.js";