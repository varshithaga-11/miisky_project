import os
import re

files_updated = 0

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith(('.ts', '.tsx')):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original = content
            # Fix imports from ../../utils to ../utils
            content = re.sub(r'from "\.\.\/\.\.\/utils\/', r'from "../utils/', content)
            content = re.sub(r"from '\.\.\/\.\.\/utils\/", r"from '../utils/", content)
            
            if content != original:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                files_updated += 1
                print(f'Updated: {filepath}')

print(f'\nTotal files updated: {files_updated}')
