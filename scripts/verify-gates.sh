#!/usr/bin/env bash
# Run before declaring any milestone done.
set -e
npm run typecheck && npm run lint && npm run test && npm run build
if command -v rive >/dev/null 2>&1 && [ -d rive/rml ]; then rive rive/rml --verify || { echo "Rive verify FAILED"; exit 1; }; fi
echo "ALL GATES PASSED. Now browser-verify, commit, then STOP."
