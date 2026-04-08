import urllib.request
import os
import concurrent.futures

os.makedirs('images/cards', exist_ok=True)

def download(card_info):
    prefix, num = card_info
    numStr = str(num).zfill(2)
    filename = f"{prefix}{numStr}.jpg"
    url = f"https://raw.githubusercontent.com/metabismuth/tarot-json/master/cards/{filename}"
    filepath = f"images/cards/{filename}"
    if not os.path.exists(filepath):
        try:
            print(f"Downloading {filename}...")
            urllib.request.urlretrieve(url, filepath)
        except Exception as e:
            print(f"Failed to download {filename}: {e}")

cards = []
# Major
for i in range(22):
    cards.append(('m', i))
# Minor
for suit in ['w', 'c', 's', 'p']:
    for i in range(1, 15):
        cards.append((suit, i))

with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
    executor.map(download, cards)

print("Done downloading 78 cards.")
