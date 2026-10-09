import sys, os
path = sys.argv[1]
hex_data = sys.argv[2]
content = bytes.fromhex(hex_data)
os.makedirs(os.path.dirname(path), exist_ok=True)
with open(path, 'wb') as f:
    f.write(content)
print(f'Wrote {path} ({len(content)} bytes)')
