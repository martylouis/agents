#!/bin/bash
# Create CLAUDE.md symlinks for all AGENTS.md files that don't have one

set -e

created=0
skipped=0
errors=0

echo "Searching for AGENTS.md files..."
echo

while IFS= read -r agents_file; do
    dir=$(dirname "$agents_file")
    claude_file="$dir/CLAUDE.md"

    if [ -e "$claude_file" ] || [ -L "$claude_file" ]; then
        if [ -L "$claude_file" ]; then
            echo "✓ $dir - symlink exists"
        else
            echo "⚠ $dir - CLAUDE.md exists as file (skipping)"
            ((errors++))
        fi
        ((skipped++))
    else
        cd "$dir"
        ln -s AGENTS.md CLAUDE.md
        cd - > /dev/null
        echo "✓ $dir - created symlink"
        ((created++))
    fi
done < <(find . -name "AGENTS.md" -type f 2>/dev/null)

echo
echo "Summary:"
echo "  Created: $created"
echo "  Skipped: $skipped"
echo "  Errors:  $errors"
