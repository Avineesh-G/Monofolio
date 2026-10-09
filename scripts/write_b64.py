import sys, os, base64

def write_b64(path, b64_str):
    d = os.path.dirname(path)
    if d:
        os.makedirs(d, exist_ok=True)
    raw = base64.b64decode(b64_str.strip())
    with open(path, 'wb') as f:
        f.write(raw)
    print(f'Wrote {path} ({len(raw)} bytes)')

if __name__ == '__main__':
    path = sys.argv[1]
    b64 = sys.argv[2]
    write_b64(path, b64)
