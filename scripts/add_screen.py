import sys, json, os, base64
path, b64 = sys.argv[1], sys.argv[2]
content = base64.b64decode(b64.encode('utf-8')).decode('utf-8')
try:
    data = json.load(open('scripts/screens.json', 'r', encoding='utf-8'))
except:
    data = {}
data[path] = content
with open('scripts/screens.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)
print('Added ', path, len(content))
