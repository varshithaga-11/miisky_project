import os
import re

def find_files(d):
    res = []
    for root, dirs, files in os.walk(d):
        for f in files:
            if f.endswith('.tsx') or f.endswith('.ts'):
                res.append(os.path.join(root, f))
    return res

target_dir = r"c:\Users\Vidhu\Documents\GitHub\miisky_project\frontend\src\pages\MasterSide"
files = find_files(target_dir)

count = 0
for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. replace setX(data.results)
    new_content = re.sub(
        r'set([A-Za-z0-9]+)\(\s*([a-zA-Z0-9_]+)\.results\s*\)',
        r'set\1(\2?.results || (Array.isArray(\2) ? \2 : []))',
        content
    )
    
    # 2. replace x.length === 0 -> (!x || x.length === 0)
    # only if not preceded by `|| ` or ` ` with `!`
    def length_repl(match):
        full = match.group(0)
        var_name = match.group(1)
        # Check string before match
        start = match.start()
        if start > 0 and new_content[start-1] in '|&!.?':
            return full
        if start > 3 and new_content[start-3:start] == '|| ':
            return full
        return f"(!{var_name} || {full})"

    new_content = re.sub(r'([A-Za-z0-9_]+)\.length\s*===?\s*0', length_repl, new_content)

    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        count += 1
        print("Updated:", file)

print("Updated", count, "files.")
