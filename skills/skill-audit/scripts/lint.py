#!/usr/bin/env python3
"""Deterministic lint checks for an agent skill.

Usage: lint.py <skill-dir-or-SKILL.md>
Exits 0 if all checks pass, 1 otherwise. Output is machine-readable JSON on stdout.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

TIME_SENSITIVE_PATTERNS = [
    r"\bas of \d{4}\b",
    r"\bcurrently\b",
    r"\brecently\b",
    r"\bnew(?:est)? (?:feature|version|model)\b",
    r"\blatest version\b",
]

FIRST_PERSON = re.compile(r"\b(I|we|my|our)\b", re.IGNORECASE)

def parse_frontmatter(text: str) -> tuple[dict, int]:
    """Return (fields, body_start_line). Supports scalar values and YAML folded (`>`) / literal (`|`) block scalars."""
    if not text.startswith("---\n"):
        return {}, 0
    end = text.find("\n---\n", 4)
    if end == -1:
        return {}, 0
    block = text[4:end]
    lines = block.splitlines()
    fields: dict = {}
    i = 0
    while i < len(lines):
        line = lines[i]
        if ":" not in line or line.lstrip() != line:
            i += 1
            continue
        k, _, v = line.partition(":")
        key = k.strip()
        val = v.strip()
        if val in (">", "|", ">-", "|-", ">+", "|+"):
            folded = val.startswith(">")
            i += 1
            collected: list[str] = []
            while i < len(lines) and (lines[i].startswith((" ", "\t")) or lines[i] == ""):
                collected.append(lines[i].strip())
                i += 1
            if folded:
                # Join non-empty runs with spaces; blank lines become newlines.
                out_parts: list[str] = []
                buf: list[str] = []
                for piece in collected:
                    if piece == "":
                        if buf:
                            out_parts.append(" ".join(buf))
                            buf = []
                        out_parts.append("")
                    else:
                        buf.append(piece)
                if buf:
                    out_parts.append(" ".join(buf))
                fields[key] = "\n".join(out_parts).strip()
            else:
                fields[key] = "\n".join(collected).strip()
            continue
        fields[key] = val
        i += 1
    body_start = text[: end + 5].count("\n")
    return fields, body_start

def check(skill_path: Path) -> dict:
    if skill_path.is_dir():
        skill_md = skill_path / "SKILL.md"
        skill_dir = skill_path
    else:
        skill_md = skill_path
        skill_dir = skill_path.parent

    results = {"path": str(skill_md), "checks": [], "pass": True}

    def add(name, status, detail=""):
        results["checks"].append({"name": name, "status": status, "detail": detail})
        if status == "fail":
            results["pass"] = False

    if not skill_md.exists():
        add("skill_md_exists", "fail", f"{skill_md} not found")
        return results
    add("skill_md_exists", "pass")

    text = skill_md.read_text()
    line_count = text.count("\n") + 1
    add("line_count", "pass" if line_count <= 100 else ("warn" if line_count <= 200 else "fail"),
        f"{line_count} lines")

    fields, _ = parse_frontmatter(text)
    if not fields:
        add("frontmatter", "fail", "missing or invalid YAML frontmatter")
        return results
    add("frontmatter", "pass")

    name = fields.get("name", "")
    add("frontmatter_name", "pass" if name else "fail", f"name={name!r}")
    if name and skill_dir.name != name:
        add("name_matches_dir", "warn", f"dir={skill_dir.name!r} name={name!r}")
    else:
        add("name_matches_dir", "pass")

    desc = fields.get("description", "")
    if not desc:
        add("description_present", "fail")
    else:
        add("description_present", "pass")
        add("description_length", "pass" if len(desc) <= 1024 else "fail",
            f"{len(desc)} chars")
        add("description_use_when", "pass" if re.search(r"use when", desc, re.I) else "warn",
            "missing 'Use when…' clause" if not re.search(r"use when", desc, re.I) else "")
        fp = FIRST_PERSON.search(desc)
        add("description_third_person", "pass" if not fp else "warn",
            f"first-person word: {fp.group(0)!r}" if fp else "")

    body = text.split("\n---\n", 1)[-1] if "\n---\n" in text else text
    hits = []
    for pat in TIME_SENSITIVE_PATTERNS:
        for m in re.finditer(pat, body, re.I):
            hits.append(m.group(0))
    add("time_sensitive", "pass" if not hits else "warn",
        f"matches: {hits}" if hits else "")

    link_re = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")
    broken = []
    for m in link_re.finditer(body):
        href = m.group(2)
        if href.startswith(("http://", "https://", "#", "mailto:")):
            continue
        target = (skill_dir / href).resolve()
        if not target.exists():
            broken.append(href)
    add("relative_links", "pass" if not broken else "fail",
        f"broken: {broken}" if broken else "")

    bundled = [p for p in skill_dir.rglob("*") if p.is_file() and p != skill_md
               and not p.name.startswith(".")]
    referenced = set()
    for m in link_re.finditer(body):
        href = m.group(2)
        if not href.startswith(("http", "#", "mailto:")):
            referenced.add((skill_dir / href).resolve())
    orphans = [str(p.relative_to(skill_dir)) for p in bundled
               if p.resolve() not in referenced and p.suffix == ".md"]
    add("orphan_files", "pass" if not orphans else "warn",
        f"unreferenced .md: {orphans}" if orphans else "")

    META_H2 = {"notes", "process", "report template", "what to check",
               "quick start", "workflows", "advanced features",
               "review checklist", "severity guide"}
    body_no_code = re.sub(r"```.*?```", "", body, flags=re.S)
    h2s = re.findall(r"^##\s+(.+?)\s*$", body_no_code, re.M)
    workflow_h2s = [h for h in h2s if h.strip().lower().lstrip("0123456789. ") not in META_H2]
    wf_count = len(workflow_h2s)
    add("modularity_workflow_h2s",
        "pass" if wf_count < 5 else ("warn" if wf_count < 7 else "fail"),
        f"{wf_count} workflow H2s: {workflow_h2s}")

    bundle_loc = line_count
    for p in bundled:
        if p.suffix == ".md":
            try:
                bundle_loc += p.read_text().count("\n") + 1
            except Exception:
                pass
    add("modularity_bundle_loc",
        "pass" if bundle_loc <= 500 else ("warn" if bundle_loc <= 1000 else "fail"),
        f"{bundle_loc} total .md lines")

    return results

def main():
    if len(sys.argv) != 2:
        print("usage: lint.py <skill-dir-or-SKILL.md>", file=sys.stderr)
        sys.exit(2)
    results = check(Path(sys.argv[1]))
    print(json.dumps(results, indent=2))
    sys.exit(0 if results["pass"] else 1)

if __name__ == "__main__":
    main()
