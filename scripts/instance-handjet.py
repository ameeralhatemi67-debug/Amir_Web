"""Freeze Handjet into static LED instances.

Handjet's variable outlines are built from many dot contours, and Chrome spends seconds of layout
time interpolating them on a throttled phone. The site only uses two settings (lit and unlit round
dots), so they ship as static WOFF2 files. Run with a Python that has fontTools and brotli:

    python scripts/instance-handjet.py
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

SOURCE = Path('node_modules/@fontsource-variable/handjet/files')
OUT = Path('public/fonts')
OUT.mkdir(parents=True, exist_ok=True)
INSTANCES = {'lit': 560, 'unlit': 260}

for subset in ('latin', 'arabic'):
    for name, weight in INSTANCES.items():
        font = TTFont(SOURCE / f'handjet-{subset}-full-normal.woff2')
        static = instantiateVariableFont(font, {'ELSH': 8, 'ELGR': 1, 'wght': weight}, updateFontNames=False)
        static.flavor = 'woff2'
        target = OUT / f'handjet-{name}-{subset}.woff2'
        static.save(target)
        print(target, target.stat().st_size)
