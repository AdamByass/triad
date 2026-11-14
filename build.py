#!/usr/bin/env python3
"""Build index.html from src/. Run: python3 build.py"""
import os
d=os.path.dirname(os.path.abspath(__file__)); src=os.path.join(d,'src')
js='\n'.join(open(os.path.join(src,f),encoding='utf8').read() for f in ['theory.js','curriculum.js','curriculum2.js','audio.js','app.js'])
html=open(os.path.join(src,'shell.html'),encoding='utf8').read().replace('/*__SCRIPTS__*/',js)
open(os.path.join(d,'index.html'),'w',encoding='utf8').write(html)
print('built',len(html)//1024,'KiB')
