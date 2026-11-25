"""Replace straight double quotes in Chinese prose with explicit curly quotes.

kramdown's smart_quotes decides open/close from the neighbouring character and
gets it wrong next to CJK (e.g. `写到："xx"` -> `写到：”xx”`). Writing “ ” in
the source sidesteps that, because kramdown leaves curly quotes alone.

Skips: front matter, fenced/indented code, inline code, HTML tags, Liquid
tags, kramdown IALs ({:...}), shell-command lines, markdown link targets,
`data-lang-block="en"` blocks, and lines with no CJK. Lines with an odd
number of quotes (e.g. a quote spanning two lines) are left alone and listed
for manual review. Nested quotes come out as “…”…“…”; fix those by hand
with ‘ ’ inside.

usage (from the repo root):
    python3 scripts/fix_quotes.py _posts/*.md           # dry run, lists odd lines
    python3 scripts/fix_quotes.py --write _posts/*.md   # rewrite in place
"""
import re
import sys

CJK = re.compile(r'[㐀-鿿　-〿＀-￯]')
# segments we must not touch inside a line
PROTECT = re.compile(r'`[^`]*`|<[^>]*>|\{[%{].*?[%}]\}|\{:[^}]*\}|\]\([^)]*\)')
SHELL = re.compile(r'^\s*(>\s*)?\$ |\$\(')


def convert_line(line):
    parts, last = [], 0
    for m in PROTECT.finditer(line):
        parts.append((False, line[last:m.start()]))
        parts.append((True, m.group()))
        last = m.end()
    parts.append((False, line[last:]))
    n = sum(seg.count('"') for prot, seg in parts if not prot)
    if n == 0:
        return line, 0, False
    if n % 2:
        return line, 0, True
    out, opened = [], False
    for prot, seg in parts:
        if prot:
            out.append(seg)
            continue
        buf = []
        for ch in seg:
            if ch == '"':
                buf.append('”' if opened else '“')
                opened = not opened
            else:
                buf.append(ch)
        out.append(''.join(buf))
    return ''.join(out), n // 2, False


def process(path, write):
    lines = open(path, encoding='utf-8').read().split('\n')
    out, pairs, odd = [], 0, []
    in_fm = in_fence = in_en = False
    for i, line in enumerate(lines):
        s = line.strip()
        if i == 0 and s == '---':
            in_fm = True
        elif in_fm:
            in_fm = s != '---'
        elif re.match(r'^(```|~~~)', s):
            in_fence = not in_fence
        elif 'data-lang-block="en"' in line:
            in_en = True
        elif in_en and s == '</div>':
            in_en = False
        elif not (in_fence or in_en or line.startswith(('    ', '\t')) or SHELL.search(line)) and CJK.search(line):
            line, n, is_odd = convert_line(line)
            pairs += n
            if is_odd:
                odd.append((i + 1, s[:80]))
        out.append(line)
    if write and pairs:
        open(path, 'w', encoding='utf-8').write('\n'.join(out))
    return pairs, odd


if __name__ == '__main__':
    write = '--write' in sys.argv
    total = 0
    for f in [a for a in sys.argv[1:] if a != '--write']:
        pairs, odd = process(f, write)
        total += pairs
        if pairs or odd:
            print(f'{f}: {pairs} pairs' + (f', {len(odd)} odd lines' if odd else ''))
        for ln, txt in odd:
            print(f'    odd quote count, line {ln}: {txt}')
    print('total pairs:', total, '(written)' if write else '(dry run)')
