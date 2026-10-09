import sys, os
path = sys.argv[1]
hex_data = sys.argv[2]
is_first = sys.argv[3] == '1'
mode = 'wb' if is_first else 'ab'
os.makedirs(os.path.dirname(path), exist_ok=True)
with open(path, mode) as f:
    f.write(bytes.fromhex(hex_data))
print(f"Updated {path} (size: {os.path.getsize(path)})")
