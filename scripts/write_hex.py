import sys, os, binascii
path = sys.argv[1]
hex_data = sys.argv[2]
d = os.path.dirname(path)
if d:
    os.makedirs(d, exist_ok=True)
data = binascii.unhexlify(hex_data)
with open(path, 'wb') as f:
    f.write(data)
print(f'Wrote {path} ({len(data)} bytes)')
