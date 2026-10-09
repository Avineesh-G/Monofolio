import os, sys

def save(p, text):
    d = os.path.dirname(p)
    if d:
        os.makedirs(d, exist_ok=True)
    with open(p, 'w', encoding='utf-8') as f:
        f.write(text)
    print('Wrote:', p)

if __name__ == '__main__':
    save(sys.argv[1], sys.argv[2])
