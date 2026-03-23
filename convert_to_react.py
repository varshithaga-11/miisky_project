#!/usr/bin/env python3
"""
Convert Next.js imports to React in the client-ui application.
Replaces:
- next/image -> custom Image component
- next/link -> react-router-dom Link
- next/navigation -> react-router-dom hooks
"""

import os
import re
from pathlib import Path

def process_file(filepath):
    """Process a single file and convert Next.js imports to React."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Replace next/image imports
        content = re.sub(
            r'import\s+Image\s+from\s+["\']next/image["\']',
            'import Image from "@/components/Image"',
            content
        )
        
        # Replace next/link imports
        content = re.sub(
            r'import\s+Link\s+from\s+["\']next/link["\']',
            'import { Link } from "react-router-dom"',
            content
        )
        
        # Replace next/navigation imports
        content = re.sub(
            r'import\s+\{\s*useRouter\s*\}\s+from\s+["\']next/navigation["\']',
            'import { useNavigate } from "react-router-dom"',
            content
        )
        content = re.sub(
            r'import\s+\{\s*useSearchParams\s*\}\s+from\s+["\']next/navigation["\']',
            'import { useSearchParams } from "react-router-dom"',
            content
        )
        
        # Replace useRouter with useNavigate
        content = re.sub(
            r'const\s+router\s+=\s+useRouter\(\)',
            'const navigate = useNavigate()',
            content
        )
        
        # Replace router.push with navigate
        content = re.sub(
            r'router\.push\(',
            'navigate(',
            content
        )
        
        # Replace Link href with to
        content = re.sub(
            r'<Link\s+href=',
            '<Link to=',
            content
        )
        
        # Remove "use client" directives
        content = re.sub(
            r'^["\']use client["\'];?\s*\n',
            '',
            content,
            flags=re.MULTILINE
        )
        
        # Write back if changed
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def main():
    """Process all TypeScript/JavaScript files in the client-ui directory."""
    # Use the current working directory as base
    base_path = Path.cwd()
    client_ui_path = base_path / "frontend" / "src" / "client-ui"
    
    if not client_ui_path.exists():
        print(f"Error: client-ui directory not found at {client_ui_path}")
        print(f"Current directory: {base_path}")
        print(f"Contents: {list(base_path.iterdir())}")
        return
    
    print(f"Processing files in: {client_ui_path}")
    
    # Find all TypeScript and JavaScript files
    files = []
    for ext in ['*.tsx', '*.ts', '*.jsx', '*.js']:
        for f in client_ui_path.glob(f'**/{ext}'):
            # Skip node_modules
            if 'node_modules' not in f.parts:
                files.append(f)
    
    print(f"Found {len(files)} files to process")
    
    count = 0
    for filepath in files:
        if process_file(filepath):
            count += 1
            print(f"✓ Updated: {filepath.relative_to(client_ui_path)}")
    
    print(f"\n✅ Conversion complete! Updated {count} file(s).")

if __name__ == "__main__":
    main()
