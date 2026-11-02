#!/usr/bin/env bash
# Verifies every Mach-O binary in the packaged mac apps was built for the app's arch.
# A universal binary passes as long as it contains the expected arch.
#
# Usage: scripts/verify-mac-arch.sh [out-dir]   (default: out)
# Expects <out-dir>/Loadmill-darwin-x64/Loadmill.app and <out-dir>/Loadmill-darwin-arm64/Loadmill.app.
set -euo pipefail

OUT_DIR="${1:-out}"
APP_NAME="Loadmill.app"
failed=0

for arch in x64 arm64; do
  case "$arch" in
    x64) expected="x86_64" ;;
    arm64) expected="arm64" ;;
  esac

  app="$OUT_DIR/Loadmill-darwin-$arch/$APP_NAME"
  if [[ ! -d "$app" ]]; then
    echo "FAIL [$arch] missing app: $app"
    failed=1
    continue
  fi

  checked=0
  mismatches=0
  # -type f skips the framework symlinks, so each binary is checked once
  while IFS= read -r -d '' f; do
    if [[ "$(file -b "$f")" != *Mach-O* ]]; then
      continue
    fi
    checked=$((checked + 1))
    archs="$(lipo -archs "$f" 2>/dev/null || echo "unknown")"
    if [[ " $archs " != *" $expected "* ]]; then
      mismatches=$((mismatches + 1))
      echo "  MISMATCH [$arch] expected $expected, got '$archs': ${f#"$app"/}"
    fi
  done < <(find "$app" -type f -print0)

  echo "[$arch] $app: $checked Mach-O files checked, $mismatches mismatches"
  if [[ "$checked" -eq 0 ]]; then
    echo "FAIL [$arch] no Mach-O files found in $app"
    failed=1
  elif [[ "$mismatches" -gt 0 ]]; then
    echo "FAIL [$arch] $mismatches binaries are not built for $expected"
    failed=1
  fi
done

if [[ "$failed" -ne 0 ]]; then
  echo "Mac arch verification FAILED"
  exit 1
fi
echo "Mac arch verification passed"
