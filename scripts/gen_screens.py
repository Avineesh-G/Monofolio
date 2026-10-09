import base64, os

def put(path, b64):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, 'wb').write(base64.b64decode(b64))
    print(f'Wrote {path}')

