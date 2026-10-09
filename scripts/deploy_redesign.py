#!/usr/bin/env python3
# Redesign Deployer
import os, sys

def write(path, text):
    d = os.path.dirname(path)
    if d:
        os.makedirs(d, exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)
    print(f'Wrote {path} ({len(text)} chars)')

print('Redesign Deployer ready')
