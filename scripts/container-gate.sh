#!/usr/bin/env bash
# Urblo local container gate.
#
# Builds the gate image, which runs build -> lint -> typecheck -> smoke inside a
# clean Node container. If the build succeeds, every gate passed and the change
# is safe to push to a branch. If any gate fails, `docker build` exits non-zero
# and this script reports failure.
#
# Usage: npm run gate
set -euo pipefail

cd "$(dirname "$0")/.."

IMAGE="urblo-gate:local"

trap 'echo ""; echo "❌ Container gate FAILED — do NOT push. Fix the failures above, then re-run: npm run gate" >&2' ERR

echo "▶ Running Urblo container gate (build · lint · typecheck · smoke)…"
docker build -f Dockerfile.gate -t "$IMAGE" .

echo ""
echo "✅ Container gate PASSED — change is safe to push to a branch."
