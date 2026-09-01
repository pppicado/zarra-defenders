#!/usr/bin/env bash
#
# scripts/verify.sh — Structural readback for `zarra-defenders`.
#
# This script is the AUTOMATED companion to MANUAL_PLAYTHROUGH.md
# (REQ-15). It runs 8 structural checks that don't require a browser
# to validate:
#
#   1. STRINGS usage (positive check) — `STRINGS.` references appear
#      somewhere under src/. Verifies the i18n contract.
#
#   2. Spanish-prose isolation (negative check) — no accented Spanish
#      anywhere under src/ outside content/data.js. Per A2 + content-
#      strings spec §Single STRINGS Object.
#
#   3. Model catalog count — `find src/content/models -name '*.js'`
#      MUST equal 22 (1 index + 21 factories).
#
#   4. Asset budget — `du -sb` of project root MUST be <= 2 MB.
#
#   5. A5 — `datos.{nivel{1-5}, final}.fuente` all non-empty (6
#      checks). Per the proposal: pre-researched citations ship
#      ready, no TODO pedagogía markers.
#
#   6. A6 — zero `https://` matches in `src/` outside
#      `content/data.js`. All URLs live under STRINGS.final.enlaces.
#
#   7. A7 — all 5 boss factories set `lifecycle.*desactivacion`:
#      topadora, tubo_lixiviado, incineradora, trailer,
#      planta_treco.
#
#   8. A8 — zero `console.X` calls in `src/` outside
#      `engine/dom.js`. Production debug logging MUST route through
#      `__zarra.{log,warn,error}`.
#
# Exit code: 0 if all checks pass, 1 otherwise.
#
# Usage:
#   bash scripts/verify.sh                # verify the local repo
#   bash scripts/verify.sh /path/to/repo  # verify a clone elsewhere

set -euo pipefail

PROJECT_ROOT="${1:-$(cd "$(dirname "$0")/.." && pwd)}"
SRC="$PROJECT_ROOT/src"
MODELS="$PROJECT_ROOT/src/content/models"
DATA="$PROJECT_ROOT/src/content/data.js"

PASS=0
FAIL=0
WARN=0

bold() { printf '\033[1m%s\033[0m' "$1"; }
green() { printf '\033[32m%s\033[0m' "$1"; }
red() { printf '\033[31m%s\033[0m' "$1"; }
yellow() { printf '\033[33m%s\033[0m' "$1"; }

emit_pass() { echo "  $(green PASS)  $1"; PASS=$((PASS + 1)); }
emit_fail() { echo "  $(red FAIL)  $1"; FAIL=$((FAIL + 1)); }
emit_warn() { echo "  $(yellow WARN)  $1"; WARN=$((WARN + 1)); }

check_eq() {
  local name="$1"; local expect="$2"; local actual="$3"
  if [[ "$actual" == "$expect" ]]; then
    emit_pass "$name  (got $actual)"
  else
    emit_fail "$name  (expected $expect, got $actual)"
  fi
}

echo
echo "$(bold "=== zarra-defenders structural readback ===")"
echo "Project root: $PROJECT_ROOT"
echo

# --------------------------------------------------------------------- 1
echo "$(bold "1. STRINGS usage (positive)")"
STRINGS_USE_COUNT=$(grep -R "STRINGS\." "$SRC" 2>/dev/null | wc -l | tr -d ' ')
if [[ "$STRINGS_USE_COUNT" -ge 1 ]]; then
  emit_pass "STRINGS references in src/  (got $STRINGS_USE_COUNT)"
else
  emit_fail "STRINGS references in src/  (got $STRINGS_USE_COUNT)"
fi
echo

# --------------------------------------------------------------------- 2
echo "$(bold "2. Spanish-prose isolation")"
SPANISH_LEAKS=$(grep -RnE '[áéíóúñ¿¡]' "$SRC" 2>/dev/null | grep -v 'content/data.js' || true | wc -l | tr -d ' ')
check_eq "Spanish prose outside content/data.js" "0" "$SPANISH_LEAKS"
if [[ "$SPANISH_LEAKS" != "0" ]]; then
  echo "    $(yellow "Offending matches:")"
  grep -RnE '[áéíóúñ¿¡]' "$SRC" 2>/dev/null | grep -v 'content/data.js' | head -5
fi
echo

# --------------------------------------------------------------------- 3
echo "$(bold "3. Model catalog count")"
MODEL_COUNT=$(find "$MODELS" -name '*.js' 2>/dev/null | grep -v '/_' | wc -l | tr -d ' ')
check_eq "src/content/models/*.js count" "22" "$MODEL_COUNT"
echo

# --------------------------------------------------------------------- 4
echo "$(bold "4. Asset budget")"
# The 2 MB cap is OPERATIONAL: it's the size of what GitHub Pages will
# serve. Local-only metadata (.git/, .atl/, .engram/, .playwright-mcp/)
# never ships to the user, so we exclude it. Track only deployable
# content: source, assets, index.html, scripts.
TOTAL_BYTES=$(du -sb --exclude=.git --exclude=.atl --exclude=.engram --exclude=.playwright-mcp "$PROJECT_ROOT" 2>/dev/null | awk '{print $1}')
TOTAL_HUMAN=$(du -sh --exclude=.git --exclude=.atl --exclude=.engram --exclude=.playwright-mcp "$PROJECT_ROOT" 2>/dev/null | awk '{print $1}')
echo "    Project size (deployable): $TOTAL_HUMAN ($TOTAL_BYTES bytes)"
if (( TOTAL_BYTES <= 2097152 )); then
  emit_pass "Deployable project <= 2 MB"
else
  emit_fail "Deployable project > 2 MB"
fi
echo

# --------------------------------------------------------------------- 5
echo "$(bold "5. A5 — pedagogical fuentes non-empty")"
DATO_KEYS=(nivel1 nivel2 nivel3 nivel4 nivel5 final)
DATO_FAIL=0
for k in "${DATO_KEYS[@]}"; do
  # Extract the `fuente:` value for the bloque keyed `k:`. The bloque is
  # delimited by `<k>: {` and the matching `},`; fuente sits inside.
  VALUE=$(sed -n "/^[[:space:]]*${k}:[[:space:]]*{/,/^[[:space:]]*},/p" "$DATA" \
            | grep "fuente:" \
            | head -1 \
            | sed -E 's/.*fuente:[[:space:]]*"([^"]*)".*/\1/')
  if [[ -z "${VALUE// }" ]]; then
    emit_fail "STRINGS.datos.$k.fuente is empty"
    DATO_FAIL=$((DATO_FAIL + 1))
  else
    emit_pass "STRINGS.datos.$k.fuente  = \"$VALUE\""
  fi
done
# TODO pedagogia markers MUST be absent.
TODO_COUNT=$(grep -c "TODO pedagog" "$DATA" 2>/dev/null || true)
if (( TODO_COUNT == 0 )); then
  emit_pass "No TODO pedagogia markers in data.js"
else
  emit_fail "Found $TODO_COUNT TODO pedagogia markers in data.js"
fi
echo

# --------------------------------------------------------------------- 6
echo "$(bold "6. A6 — zero https:// literals outside content/data.js")"
URL_LEAKS=$(grep -RnE 'https?://' "$SRC" 2>/dev/null | grep -v 'content/data.js' | grep -v '// ' || true | wc -l | tr -d ' ')
# Also filter out matches inside JSDoc-style comments that reference
# URLs as documentation only.
URL_LEAKS_STRICT=$(grep -RnE 'https?://' "$SRC" 2>/dev/null | grep -v 'content/data.js' || true | wc -l | tr -d ' ')
check_eq "https:// matches outside content/data.js" "0" "$URL_LEAKS_STRICT"
if [[ "$URL_LEAKS_STRICT" != "0" ]]; then
  echo "    $(yellow "Offending matches:")"
  grep -RnE 'https?://' "$SRC" 2>/dev/null | grep -v 'content/data.js' | head -5
fi
echo

# --------------------------------------------------------------------- 7
echo "$(bold "7. A7 — all 5 boss factories carry lifecycle='desactivacion'")"
BOSS_IDS=(topadora tubo_lixiviado incineradora trailer planta_treco)
A7_FAIL=0
for id in "${BOSS_IDS[@]}"; do
  FILE="$MODELS/enemies/${id}.js"
  if [[ ! -f "$FILE" ]]; then
    emit_fail "$id factory file missing"
    A7_FAIL=$((A7_FAIL + 1))
    continue
  fi
  if grep -qE "lifecycle.*['\"]desactivacion['\"]" "$FILE"; then
    emit_pass "$id sets lifecycle='desactivacion'"
  else
    emit_fail "$id does NOT set lifecycle='desactivacion'"
    A7_FAIL=$((A7_FAIL + 1))
  fi
done
echo

# --------------------------------------------------------------------- 8
echo "$(bold "8. A8 — zero console.X calls in src/ outside engine/dom.js")"
CONSOLE_LEAKS=$(grep -RnE 'console\.(log|warn|error|info|debug)' "$SRC" 2>/dev/null | grep -v 'engine/dom.js' || true | wc -l | tr -d ' ')
check_eq "console.X calls outside engine/dom.js" "0" "$CONSOLE_LEAKS"
if [[ "$CONSOLE_LEAKS" != "0" ]]; then
  echo "    $(yellow "Offending matches:")"
  grep -RnE 'console\.(log|warn|error|info|debug)' "$SRC" 2>/dev/null | grep -v 'engine/dom.js' | head -5
fi
echo

# --------------------------------------------------------------------- Summary
echo "$(bold "=== Summary ===")"
echo "  Passed:   $(green "$PASS")"
echo "  Failed:   $(red "$FAIL")"
echo "  Warnings: $(yellow "$WARN")"
echo

if (( FAIL > 0 )); then
  echo "$(red "STRUCTURAL READBACK FAILED")"
  exit 1
fi

if (( WARN > 0 )); then
  echo "$(yellow "STRUCTURAL READBACK PASSED WITH WARNINGS")"
  exit 0
fi

echo "$(green "STRUCTURAL READBACK PASSED")"
exit 0