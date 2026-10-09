import base64, json, sys, os

def main():
    if len(sys.argv) > 1:
        with open(sys.argv[1], 'r', encoding='utf-8') as f:
            data = json.load(f)
    else:
        data = json.load(sys.stdin)
    for filepath, b64_content in data.items():
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        content = base64.b64decode(b64_content).decode('utf-8')
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print('Successfully wrote:', filepath)

if __name__ == '__main__':
    main()
