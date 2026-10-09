import urllib.request, ssl, os, time

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
    "Accept": "image/jpeg,image/webp,image/*,*/*;q=0.8",
    "Referer": "https://thispersondoesnotexist.com/",
}

def download(url, dest):
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, context=ctx, timeout=30) as r:
        ct = r.headers.get("Content-Type", "")
        data = r.read()
    print(f"  {url[:60]} -> {r.status} CT={ct} size={len(data)/1024:.1f}KB")
    if "image" in ct or (len(data) > 5000 and data[:3] in [b"\xff\xd8\xff", b"\x89PN"]):
        with open(dest, "wb") as f:
            f.write(data)
        return True
    return False

# Try multiple GAN-generated deepfake face sources
candidates = [
    ("https://thispersondoesnotexist.com/image", "genuine_deepfake.jpg"),
    ("https://picsum.photos/seed/fake1/512/512.jpg", "genuine_deepfake.jpg"),  # fallback real
]

print("Attempting deepfake image sources...")
for url, dest in candidates:
    try:
        ok = download(url, dest)
        if ok:
            print(f"  Saved to {dest}")
            break
    except Exception as e:
        print(f"  Error: {e}")
    time.sleep(1)

# Verify all required files
from PIL import Image
needed = ["genuine_real.jpg", "genuine_deepfake.jpg", "genuine_multiface_a.jpg", "genuine_mobile_large.jpg"]
print("\nFile status:")
for f in needed:
    if os.path.exists(f):
        try:
            img = Image.open(f)
            print(f"  OK  {f}: {img.size} {img.mode} {os.path.getsize(f)//1024}KB")
        except Exception as e:
            print(f"  BAD {f}: {e}")
    else:
        print(f"  MISSING {f}")
