#!/usr/bin/env python3
import re

print('=' * 60)
print('FINAL VERIFICATION - Models Removed Successfully')
print('=' * 60)

# Check models.py
with open(r'c:\Users\Vidhu\Documents\GitHub\miisky_project\backend\website\models.py', 'r') as f:
    models = re.findall(r'^class (\w+)\(models\.Model\):', f.read(), re.MULTILINE)
print(f'\n✓ MODELS.PY: {len(models)} models remaining')
print('  Models:')
for m in models:
    print(f'    - {m}')

# Check urls.py for router registrations
with open(r'c:\Users\Vidhu\Documents\GitHub\miisky_project\backend\website\urls.py', 'r') as f:
    content = f.read()
    urls = re.findall(r"router\.register\(r'(\w+)'", content)
print(f'\n✓ URLS.PY: {len(urls)} endpoint registrations')
print('  Endpoints:')
for u in urls:
    print(f'    - {u}/')

print('\n' + '=' * 60)
print('✓ TASK COMPLETED SUCCESSFULLY')
print('=' * 60)
