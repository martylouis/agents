#!/bin/bash
# Migrate CLAUDE.md files to AGENTS.md with symlinks for backwards compatibility

set -e

migrated=0
skipped=0
conflicts=0

echo "Searching for CLAUDE.md files to migrate..."
echo

while IFS= read -r claude_file; do
    # Skip if it's already a symlink
    if [ -L "$claude_file" ]; then
        echo "✓ $claude_file - already a symlink"
        ((skipped++))
        continue
    fi

    dir=$(dirname "$claude_file")
    agents_file="$dir/AGENTS.md"

    if [ -e "$agents_file" ]; then
        # Both exist - check if identical
        if diff -q "$claude_file" "$agents_file" > /dev/null 2>&1; then
            echo "✓ $dir - files identical, removing CLAUDE.md and creating symlink"
            rm "$claude_file"
            cd "$dir"
            ln -s AGENTS.md CLAUDE.md
            cd - > /dev/null
            ((migrated++))
        else
            echo "⚠ $dir - CONFLICT: both files exist with different content"
            echo "   Run: diff $claude_file $agents_file"
            ((conflicts++))
        fi
    else
        # Only CLAUDE.md exists - rename and symlink
        echo "→ $dir - migrating CLAUDE.md to AGENTS.md"
        mv "$claude_file" "$agents_file"
        cd "$dir"
        ln -s AGENTS.md CLAUDE.md
        cd - > /dev/null
        ((migrated++))
    fi
done < <(find . -name "CLAUDE.md" 2>/dev/null)

echo
echo "Summary:"
echo "  Migrated:  $migrated"
echo "  Skipped:   $skipped"
echo "  Conflicts: $conflicts"

if [ $conflicts -gt 0 ]; then
    echo
    echo "Resolve conflicts manually, then run again."
    exit 1
fi

if [ $migrated -gt 0 ]; then
    echo
    echo "Run 'git add -A && git status' to stage changes."
fi
