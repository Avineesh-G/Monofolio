import sys, base64, os
if len(sys.argv) >= 3:
    path = sys.argv[1]
    b64 = sys.argv[2].encode('utf-8')
    content = base64.b64decode(b64)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'wb') as f:
        f.write(content)
    print(f'Wrote {path} ({len(content)} bytes)')
