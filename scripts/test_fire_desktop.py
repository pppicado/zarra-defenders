#!/usr/bin/env python3
"""
scripts/test_fire_desktop.py

Regression test: ensures the desktop fire flow still works after the
mobile-input refactor. Pre-fix this path was the ONLY working path;
post-fix it must still dispatch fire callbacks with isMobile=false and
the mouse-look aim (yaw/pitch) should drive the forward vector.

This test does NOT request real pointer lock (Playwright headless
can't reliably satisfy that). Instead it bypasses the lock gate by
firing the handler directly: we import the module and invoke the
public `fireCallbacks` chain by dispatching a pointerdown with the
internal `isMobileInput` mock-returning false and `lockActive=true`.

The simpler way: call `input.onFire(cb)`, then dispatch a pointerdown.
On desktop with lockActive=false the handler bails out — that's the
expected behaviour, and we cover that with a separate assertion.
"""

import asyncio
import json
import sys

from playwright.async_api import async_playwright

URL = "http://localhost:8765/"


async def main() -> int:
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()

        await page.goto(URL, wait_until="load")
        await page.wait_for_function("document.getElementById('game') != null", timeout=5000)
        await page.wait_for_timeout(300)

        result = await page.evaluate(
            """async () => {
                const canvas = document.getElementById('game');

                const start = document.getElementById('start-screen');
                if (start) start.setAttribute('data-state', 'hidden');

                const input = await import('/src/engine/input.js');
                const ammo  = await import('/src/game/ammo.js');

                // On a real desktop the pointer-lock gate is required.
                // Confirm that, with lockActive=false and no mobile, a
                // pointerdown does NOT fire (no regression: desktop
                // still requires the lock).
                let desktopHits = 0;
                input.onFire(() => { desktopHits += 1; });
                const ammoBeforeLock = ammo.ammo.current;
                canvas.dispatchEvent(new PointerEvent('pointerdown', {
                    bubbles: true, cancelable: true, button: 0,
                    clientX: 100, clientY: 100, pointerType: 'mouse',
                }));
                await new Promise(r => setTimeout(r, 30));
                const hitsWhileUnlocked = desktopHits;
                const ammoWhileUnlocked = ammo.ammo.current;

                // Now simulate a successful lock: stub `pointerLockElement`
                // so the engine's `pointerlockchange` listener flips
                // `lockActive=true`. The engine listens on `document`, so
                // dispatching the event there is enough.
                Object.defineProperty(document, 'pointerLockElement', {
                    configurable: true,
                    get: () => canvas,
                });
                document.dispatchEvent(new Event('pointerlockchange'));

                const afterLockActive = input.isLockActive();

                const hitsAfterLockBefore = desktopHits;
                const ammoAfterLockBefore = ammo.ammo.current;
                canvas.dispatchEvent(new PointerEvent('pointerdown', {
                    bubbles: true, cancelable: true, button: 0,
                    clientX: 100, clientY: 100, pointerType: 'mouse',
                }));
                await new Promise(r => setTimeout(r, 30));
                const hitsAfterLockedDispatch = desktopHits - hitsAfterLockBefore;
                const ammoAfterLockedDispatch = ammo.ammo.current;

                return {
                    afterLockActive,
                    hitsWhileUnlocked,
                    ammoBeforeLock,
                    ammoWhileUnlocked,
                    hitsAfterLockedDispatch,
                    ammoAfterLockBefore,
                    ammoAfterLockedDispatch,
                    isMobile: input.isMobileInput(),
                };
            }"""
        )

        print("TEST RESULT:", json.dumps(result, indent=2))
        await browser.close()

        failures: list[str] = []
        if result.get("isMobile"):
            failures.append(f"expected desktop (isMobile=false), got {result['isMobile']}")
        if result.get("hitsWhileUnlocked") != 0:
            failures.append(
                f"expected 0 callbacks while unlocked, got {result['hitsWhileUnlocked']} "
                "(desktop must still gate fire on pointer lock)"
            )
        if result.get("ammoWhileUnlocked") != result.get("ammoBeforeLock"):
            failures.append(
                f"expected ammo unchanged while unlocked, "
                f"before={result['ammoBeforeLock']} after={result['ammoWhileUnlocked']}"
            )
        if not result.get("afterLockActive"):
            failures.append("expected lockActive=true after dispatching pointerlockchange on canvas")
        if result.get("hitsAfterLockedDispatch") != 1:
            failures.append(
                f"expected 1 callback after locked dispatch, got {result['hitsAfterLockedDispatch']}"
            )
        if result.get("ammoAfterLockedDispatch") != result.get("ammoAfterLockBefore") - 1:
            failures.append(
                f"expected ammo to decrement by 1 after locked fire, "
                f"before={result['ammoAfterLockBefore']} after={result['ammoAfterLockedDispatch']}"
            )

        if not failures:
            print("\nPASS: desktop fire still gated by pointer lock, and unlocked+locked callbacks behave correctly.")
            return 0
        else:
            print("\nFAIL:")
            for f in failures:
                print(f"  - {f}")
            return 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))