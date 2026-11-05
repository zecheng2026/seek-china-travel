#!/usr/bin/env python3
"""Read-only cross-check of Supabase Storage CSV against Hero config and repo text."""
import argparse
import csv
import json
from collections import Counter, defaultdict
from pathlib import Path
from urllib.parse import unquote, quote

SCAN_EXT = {'.ts', '.tsx', '.js', '.jsx', '.css', '.html', '.json', '.md', '.sql', '.yml', '.yaml'}
SKIP_DIRS = {'.git', '.next', 'node_modules', 'dist', 'build', 'coverage', '.vercel', 'storage-audit-output'}

def read_csv(path):
    with open(path, encoding='utf-8-sig', newline='') as f:
        return list(csv.DictReader(f))

def hero_strings(rows):
    texts = []
    for row in rows:
        for v in row.values():
            if v is not None:
                texts.append(str(v))
                try:
                    texts.append(json.dumps(json.loads(v), ensure_ascii=False))
                except (ValueError, TypeError):
                    pass
    return '\n'.join(texts)

def source_files(root, output):
    for p in root.rglob('*'):
        if not p.is_file() or p.suffix.lower() not in SCAN_EXT:
            continue
        if any(part in SKIP_DIRS for part in p.relative_to(root).parts):
            continue
        if p == Path(__file__).resolve() or p.is_relative_to(output):
            continue
        if p.name.endswith('.lock') or p.stat().st_size > 2_000_000:
            continue
        try:
            yield str(p.relative_to(root)), p.read_text(encoding='utf-8')
        except (OSError, UnicodeError):
            continue

def matching_paths(text, key):
    variants = {key, unquote(key), quote(key, safe='/'), quote(key, safe='')}
    return any(v in text for v in variants if v)

def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--storage', type=Path, required=True)
    ap.add_argument('--heroes', type=Path)
    ap.add_argument('--root', type=Path, default=Path.cwd())
    ap.add_argument('--out', type=Path, default=Path('storage-audit-output'))
    args = ap.parse_args()
    root, out = args.root.resolve(), args.out.resolve()
    storage = read_csv(args.storage)
    if not storage or not {'object_key', 'audit_status', 'bytes'}.issubset(storage[0]):
        ap.error('Storage CSV must contain object_key, audit_status, bytes')
    heroes = read_csv(args.heroes) if args.heroes else []
    htext = hero_strings(heroes)
    sources = list(source_files(root, out))
    results = []
    for row in storage:
        key = row['object_key']
        name = key.rsplit('/', 1)[-1]
        hero_hit = bool(heroes) and matching_paths(htext, key)
        code_hits = [p for p, content in sources if matching_paths(content, key)]
        basename_hits = [p for p, content in sources if name in content and p not in code_hits]
        db_hit = row['audit_status'].startswith('REFERENCED')
        if db_hit or hero_hit or code_hits:
            decision = 'KEEP - REFERENCE FOUND'
        elif basename_hits:
            decision = 'REVIEW - BASENAME MATCH ONLY'
        else:
            decision = 'REVIEW - NO REFERENCE FOUND'
        results.append({**row, 'current_hero_reference': 'YES' if hero_hit else 'NO',
                        'source_path_matches': '; '.join(code_hits),
                        'source_basename_matches': '; '.join(basename_hits),
                        'decision': decision})
    out.mkdir(parents=True, exist_ok=True)
    with (out / 'storage-crosscheck.csv').open('w', newline='', encoding='utf-8-sig') as f:
        writer = csv.DictWriter(f, fieldnames=list(results[0]))
        writer.writeheader()
        writer.writerows(results)
    counts = Counter(r['decision'] for r in results)
    bytes_by = defaultdict(int)
    for r in results:
        bytes_by[r['decision']] += int(r['bytes'])
    md = ['# SCT Storage cross-check (READ ONLY)', '',
          f'- Storage objects checked: **{len(results)}**',
          f'- Source files scanned: **{len(sources)}**',
          f'- Hero config rows: **{len(heroes)}**', '',
          '| Classification | Files | MiB |', '|---|---:|---:|']
    for key, count in counts.items():
        md.append(f'| {key} | {count} | {bytes_by[key]/1048576:.2f} |')
    md += ['', '**No objects are approved for deletion by this tool.**',
           'A snapshot cannot prove absence of dynamic URLs, external links,',
           'unscanned tables, historical campaigns, drafts, or caches.',
           'Back up originals and obtain explicit approval before deletion.', '',
           'See storage-crosscheck.csv for every object and source matches.']
    (out / 'summary.md').write_text('\n'.join(md) + '\n', encoding='utf-8')
    print('\n'.join(md))

if __name__ == '__main__':
    main()
