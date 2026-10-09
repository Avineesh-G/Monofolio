import base64, os

def write_b64(path, b64_str):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, 'wb').write(base64.b64decode(b64_str))
    print(f'Successfully wrote {path}')

