import shutil
import os

src_dir = r".\src\components\components"
dest_dir = r".\src\components"

# Move all items from nested components to parent
for item in os.listdir(src_dir):
    src_path = os.path.join(src_dir, item)
    dest_path = os.path.join(dest_dir, item)
    if os.path.exists(dest_path):
        shutil.rmtree(dest_path)
    shutil.move(src_path, dest_path)
    print(f"✅ Moved: {item}")

# Remove the now-empty nested components folder
try:
    os.rmdir(src_dir)
    print("✅ Removed empty src/components/components/ directory")
except Exception as e:
    print(f"Error removing directory: {e}")
