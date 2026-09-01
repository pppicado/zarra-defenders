#!/usr/bin/env python3
"""
scripts/test_fire_mobile.py

E2E test that REPRODUCES the bug the previous TDD cycle missed:

    Symptom: "los disparos no funcionan en el móvil"
    Root:    src/engine/input.js gates every pointerdown on `lockActive`,
             but Pointer Lock API is desktop-only. On mobile (no lock),
             the fire callback never runs.

What this test does:
    1. Loads the game with a mobile viewport + touch emulation (no
       pointer lock available).
    2. Hides the start screen so we don't have to fake the atomic
       first-click gesture.
    3. Subscribes a counter to engine/input.onFire via dynamic import.
    4. Dispatches a synthetic pointerdown on the canvas.
    5. Asserts the counter ticked (ammo.current decremented).

Expected before the fix: FAIL (counter stays 0, ammo.current == 12).
Expected after  the fix: PASS (counter == 1, ammo.current == 11).
"""

import asyncio
import json
import sys

from playwright.async_api import async_playwright

URL = "http://localhost:8765/"


async def main() -> int:
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        # iPhone 13 viewport + coarse pointer + touch, no keyboard.
        iphone = p.devices["iPhone 13"]
        context = await browser.new_context(**iphone)
        page = await context.new_page()

        console_errors: list[str] = []
        page.on("pageerror", lambda e: console_errors.append(f"pageerror: {e.message}"))
        page.on("console", lambda msg: (
            console_errors.append(f"console.error: {msg.text}")
            if msg.type == "error" else None
        ))

        await page.goto(URL, wait_until="load")
        await page.wait_for_function("document.getElementById('game') != null", timeout=5000)
        await page.wait_for_timeout(300)

        result = await page.evaluate(
            """async () => {
                const canvas = document.getElementById('game');
                if (!canvas) return { error: 'no canvas' };

                const start = document.getElementById('start-screen');
                if (start) start.setAttribute('data-state', 'hidden');

                const input = await import('/src/engine/input.js');
                const ammo  = await import('/src/game/ammo.js');

                let tapCount = 0;
                input.onFire(() => { tapCount += 1; });

                const before = ammo.ammo.current;
                const wasLocked = input.isLockActive();

                const rect = canvas.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top  + rect.height / 2;
                canvas.dispatchEvent(new PointerEvent('pointerdown', {
                    bubbles: true,
                    cancelable: true,
                    button: 0,
                    clientX: cx,
                    clientY: cy,
                    pointerType: 'touch',
                    pointerId: 1,
                    isPrimary: true,
                }));

                await new Promise((r) => setTimeout(r, 50));

                return {
                    tapCount,
                    ammoCurrent: ammo.ammo.current,
                    ammoBefore: before,
                    wasLocked,
                    userAgent: navigator.userAgent,
                    pointerCoarse: window.matchMedia('(pointer: coarse)').matches,
                    hasTouch: 'ontouchstart' in window,
                };
            }"""
        )

        print("TEST RESULT:", json.dumps(result, indent=2))
        if console_errors:
            print("CONSOLE ERRORS:", console_errors)

        await browser.close()

        failures: list[str] = []
        if result.get("error"):
            failures.append(f"test setup error: {result['error']}")
        if not result.get("hasTouch"):
            failures.append("expected mobile UA with touch, but none detected")
        if result.get("wasLocked"):
            failures.append("expected lockActive=false on mobile, got true")
        if result.get("tapCount") != 1:
            failures.append(
                f"expected tapCount=1, got {result.get('tapCount')} "
                "(the fire callback did NOT run on mobile)"
            )
        if result.get("ammoCurrent") != result.get("ammoBefore") - 1:
            failures.append(
                f"expected ammo.current to decrement by 1, "
                f"before={result.get('ammoBefore')} after={result.get('ammoCurrent')}"
            )

        if not failures:
            print("\nPASS: fire callback ran on mobile without pointer lock.")
            return 0
        else:
            print("\nFAIL:")
            for f in failures:
                print(f"  - {f}")
            return 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))