#!/bin/zsh

set -euo pipefail

SIMULATOR_TARGET="${1:-booted}"
OUTPUT_DIR="${2:-/tmp/folo-runtime-qa-$(date +%Y%m%d-%H%M%S)}"
BUNDLE_ID="${BUNDLE_ID:-com.godten.folo}"

mkdir -p "$OUTPUT_DIR"

launch_app() {
  xcrun simctl launch "$SIMULATOR_TARGET" "$BUNDLE_ID" >/dev/null 2>&1 || true
}

open_and_capture() {
  local name="$1"
  local url="$2"
  local delay="${3:-2}"

  xcrun simctl openurl "$SIMULATOR_TARGET" "$url"
  sleep "$delay"
  xcrun simctl io "$SIMULATOR_TARGET" screenshot "$OUTPUT_DIR/$name.png" >/dev/null
  printf '%s\n' "$OUTPUT_DIR/$name.png"
}

launch_app

open_and_capture "qa-widgets" "folo://qa/widgets" 2
open_and_capture "qa-feed-pagination" "folo://qa/feed-pagination" 3
open_and_capture "qa-profile-share" "folo://qa/profile-share" 3
open_and_capture "qa-trade-review" "folo://qa/trade-review" 2
open_and_capture "qa-portfolio-setup-review" "folo://qa/portfolio-setup-review" 2
