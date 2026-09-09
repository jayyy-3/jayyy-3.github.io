#!/usr/bin/env bash
set -euo pipefail
node scripts/agent-verify.mjs --suite smoke "$@"
