import os
import re

def remove_stars_from_html(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove <div id="starfield"></div>
    content = re.sub(r'<div id="starfield"></div>\s*', '', content)

    # Remove the script block that contains "document.getElementById('starfield')"
    # This regex matches from <script> to </script> where the content includes 'starfield'
    content = re.sub(r'<script>[^<]*getElementById\(\'starfield\'\)[^<]*</script>\s*', '', content, flags=re.DOTALL)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

def process_directory(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.html'):
                file_path = os.path.join(root, file)
                remove_stars_from_html(file_path)
                print(f"Processed: {file_path}")

if __name__ == '__main__':
    project_dir = r'c:\Users\Usuario\Desktop\TAROT'
    process_directory(project_dir)
    print("Done removing starfield from HTML files.")
