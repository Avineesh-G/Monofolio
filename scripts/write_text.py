import sys, os
path = sys.argv[1]
d = os.path.dirname(path)
if d:
    os.makedirs(d, exist_ok=True)
content = sys.stdin.read()
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print(f'Wrote {path} ({len(content)} chars)')
