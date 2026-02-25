#!/bin/bash
# protect-files.sh

INPUT=$(cat)

# Fail closed if jq fails (don't silently allow all operations)
if ! FILE_PATH=$(jq -r '.tool_input.file_path // empty' <<< "$INPUT"); then
  echo "Hook error: failed to parse input" >&2
  exit 2
fi

# Skip if no file path
if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

BASENAME=$(basename "$FILE_PATH")

# .env and .env.* (basename match, not substring — avoids blocking .envrc, .environment, etc.)
if [[ "$BASENAME" == ".env" ]] || [[ "$BASENAME" == .env.* ]]; then
  echo "Blocked: $FILE_PATH matches protected pattern '.env'" >&2
  exit 2
fi

if [[ "$BASENAME" == "package-lock.json" ]]; then
  echo "Blocked: $FILE_PATH matches protected pattern 'package-lock.json'" >&2
  exit 2
fi

if [[ "$FILE_PATH" == *"/.git/"* ]] || [[ "$FILE_PATH" == *"/.git" ]]; then
  echo "Blocked: $FILE_PATH matches protected pattern '.git/'" >&2
  exit 2
fi

exit 0
