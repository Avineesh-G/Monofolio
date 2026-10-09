import os

def write_f(p, s):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, 'w', encoding='utf-8') as out:
        out.write(s)
    print('Wrote', p)
