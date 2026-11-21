"""Extract story paragraphs (verbatim), embedded figures and stock data for the site.
Run from site/:  python3 scripts/extract.py
Needs poppler (pdftotext, pdfimages) and openpyxl.
"""
import glob, html, json, os, re, shutil, subprocess, tempfile
import openpyxl

ROOT = '..'
PDF = f'{ROOT}/company strategy edited.pdf'

# ---- paragraphs: rebuild from line geometry (a line ends a paragraph if the
# next line's first word would have fit on it) ----
bbox = subprocess.run(['pdftotext', '-bbox-layout', PDF, '-'], capture_output=True, text=True, check=True).stdout
lines = []
for page in re.findall(r'<page.*?</page>', bbox, re.S):
    for lb in re.findall(r'<line .*?>(.*?)</line>', page, re.S):
        words = [(float(a), float(b), html.unescape(w)) for a, b, w in re.findall(
            r'<word xMin="([\d.]+)" yMin="[\d.]+" xMax="([\d.]+)" yMax="[\d.]+">([^<]*)</word>', lb)]
        if words:
            lines.append(words)
right = max(w[-1][1] for w in lines)
paras, cur = [], []
for k, words in enumerate(lines):
    cur.append(' '.join(w[2] for w in words))
    nxt = lines[k + 1][0] if k + 1 < len(lines) else None
    if nxt is None or words[-1][1] + 4 + (nxt[1] - nxt[0]) < right - 2:
        paras.append(' '.join(cur))
        cur = []
# Edits requested after the PDF was exported (applied only if the old text is still there).
EDITS = [
    ('McDonald’s wants to be where people go when they’re trying to eat less but still want protein.',
     'McDonald’s wants to remodel its restaurants and become a place where people go when they’re trying to eat less but still want protein.'),
]
for old, new in EDITS:
    hits = [i for i, p in enumerate(paras) if old in p]
    if hits:
        paras[hits[0]] = paras[hits[0]].replace(old, new, 1)
    elif not any(new in p for p in paras):
        print('WARNING: edit not applied, text not found:', old[:60])
json.dump(paras, open('src/lib/data/story.json', 'w'), ensure_ascii=False, indent=1)

# ---- figures embedded in the PDF ----
names = ['chicken-vs-beef', 'next-costs', 'revenue-profit', 'intel-vs-mcdonalds']
os.makedirs('static/figures', exist_ok=True)
with tempfile.TemporaryDirectory() as tmp:
    subprocess.run(['pdfimages', '-png', PDF, f'{tmp}/img'], check=True)
    for src, name in zip(sorted(glob.glob(f'{tmp}/img-*.png')), names):
        shutil.copy(src, f'static/figures/{name}.png')

# ---- stock data ----
wb = openpyxl.load_workbook(f'{ROOT}/MCD and SP500.xlsx', data_only=True)
d = lambda x: x.strftime('%Y-%m-%d')
s1 = list(wb['Sheet1'].iter_rows(values_only=True))[1:]
daily = [[d(r[0]), r[1], r[3]] for r in s1 if r[0]]
s2 = list(wb['Sheet2'].iter_rows(values_only=True))[1:]
mcdWeekly = [[d(r[0]), r[1]] for r in s2 if r[0]]
s3 = list(wb['Sheet3'].iter_rows(values_only=True))[1:]
spxWeekly = [[d(r[0]), r[1]] for r in s3 if r[0]]
json.dump({'daily': daily, 'mcdWeekly': mcdWeekly, 'spxWeekly': spxWeekly},
          open('src/lib/data/stocks.json', 'w'), separators=(',', ':'))
print(len(paras), 'paragraphs;', len(names), 'figures;', len(daily), 'daily rows')
