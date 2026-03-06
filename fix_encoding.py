import os

def fix_encoding(filepath):
    try:
        with open(filepath, 'rb') as f:
            raw = f.read()
        
        # Try decoding as utf-16le first (Powershell default issue)
        try:
            content = raw.decode('utf-16le')
            # It worked. Let's write it back as utf-8
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed {filepath} from utf-16 to utf-8")
        except UnicodeDecodeError:
            # Maybe it's already utf-8 or something else
            print(f"{filepath} is not purely utf-16le")
            
    except Exception as e:
        print(f"Error checking {filepath}: {e}")

fix_encoding('products.html')
fix_encoding('index.html')
