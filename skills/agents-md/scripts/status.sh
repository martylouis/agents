#!/bin/bash
# Show status of AGENTS.md and CLAUDE.md files in the project

echo "=== AGENTS.md Files ==="
agents_count=0
while IFS= read -r file; do
    echo "  $file"
    ((agents_count++))
done < <(find . -name "AGENTS.md" -type f 2>/dev/null)

if [ $agents_count -eq 0 ]; then
    echo "  (none found)"
fi
echo "  Total: $agents_count"
echo

echo "=== CLAUDE.md Files ==="
claude_files=0
claude_symlinks=0
claude_standalone=0

while IFS= read -r file; do
    if [ -L "$file" ]; then
        target=$(readlink "$file")
        echo "  $file -> $target (symlink)"
        ((claude_symlinks++))
    else
        echo "  $file (standalone file - should migrate)"
        ((claude_standalone++))
    fi
    ((claude_files++))
done < <(find . -name "CLAUDE.md" 2>/dev/null)

if [ $claude_files -eq 0 ]; then
    echo "  (none found)"
fi
echo "  Total: $claude_files (symlinks: $claude_symlinks, standalone: $claude_standalone)"
echo

echo "=== Status ==="
if [ $claude_standalone -gt 0 ]; then
    echo "⚠ $claude_standalone CLAUDE.md file(s) need migration"
    echo "  Run: ./.claude/skills/agents-md/scripts/migrate.sh"
elif [ $agents_count -gt $claude_symlinks ]; then
    missing=$((agents_count - claude_symlinks))
    echo "⚠ $missing AGENTS.md file(s) missing CLAUDE.md symlinks"
    echo "  Run: ./.claude/skills/agents-md/scripts/ensure-symlinks.sh"
else
    echo "✓ All files are properly configured"
fi
