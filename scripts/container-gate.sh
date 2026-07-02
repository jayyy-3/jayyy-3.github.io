#!/usr/bin/env bash
# Urblo local container gate.
#
# Builds the gate image, which runs build (incl. tsc -b) -> lint -> smoke ->
# harness check inside a clean Node 20 container. `git diff --check` runs
# host-side first because the image has no .git.
#
# The gate validates the WORKING TREE as it stands, untracked files included —
# not the commit you push. Commit everything before pushing so the green
# result describes the pushed commit.
#
# Usage: npm run gate
set -euo pipefail

cd "$(dirname "$0")/.."

IMAGE="urblo-gate:local"

trap 'echo ""; echo "❌ Container gate FAILED — do NOT push. Fix the failures above, then re-run: npm run gate" >&2' ERR

echo "▶ Checking whitespace/conflict markers (git diff --check)…"
git diff --check
git diff --cached --check

echo "▶ Running Urblo container gate (build · lint · smoke · harness check)…"
docker build -f Dockerfile.gate -t "$IMAGE" .

# Drop dangling layers from superseded gate builds (label-scoped, ~1GB each).
docker image prune -f --filter "label=urblo.gate=true" >/dev/null 2>&1 || true

echo ""
echo "✅ Container gate PASSED — the working tree is green."

if [ -n "$(git status --porcelain)" ]; then
  echo ""
  echo "⚠ Uncommitted or untracked changes present:"
  git status --short
  echo "The gate validated the tree above, not your last commit. Commit everything before pushing."
fi
