// levels/registry.js
//
// Maps nivel{n} -> its level module. The dispatcher imports this when
// the user clicks a level button in the menu. Levels are loaded
// dynamically so the bootstrap doesn't pay the cost of every level
// up front.

const slugFor = (n) => [
  "hoyas_caballero",        // 1
  "hoz_zarra",              // 2
  "sierra_hunde_palomera",  // 3
  "casco_ayora",            // 4
  "acuifero",               // 5
][n - 1];

/**
 * Start level `n` (1..5). Wraps the dispatcher start with the right
 * slug.
 */
export async function start(n) {
  if (n < 1 || n > 5) {
    throw new Error(`levels/registry: unknown level ${n}`);
  }
  const slug = slugFor(n);
  const mod = await import(`./nivel${n}_${slug}.js`);
  const dispatcher = await import("../game/dispatcher.js");
  await dispatcher.startLevel(n, mod);
}