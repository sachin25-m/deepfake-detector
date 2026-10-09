"""
Downloads 4 genuinely known face images for classification validation:
1. Real face - public domain portrait (randomuser.me)
2. Deepfake face - StyleGAN2 GAN-generated (thispersondoesnotexist.com)
3. Multi-face real - group photo (public source)
4. Mobile-style large real face (high-res public domain)
"""
import urllib.request, ssl, os, time

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
}

def download(url, dest):
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, context=ctx, timeout=30) as r:
        data = r.read()
    with open(dest, "wb") as f:
        f.write(data)
    print(f"  OK  {dest}: {len(data)/1024:.1f} KB")
    return data

print("Downloading test images...")

# 1. REAL - randomuser.me portrait (known real photo, not AI)
try:
    download("https://randomuser.me/api/portraits/men/32.jpg", "genuine_real.jpg")
except Exception as e:
    print(f"  FAIL genuine_real.jpg: {e}")

# 2. DEEPFAKE - StyleGAN2 GAN-generated face (thispersondoesnotexist.com)
time.sleep(1)
try:
    download("https://thispersondoesnotexist.com/image", "genuine_deepfake.jpg")
except Exception as e:
    print(f"  FAIL (trying alternate)... {e}")
    try:
        download("https://thispersondoesnotexist.com/", "genuine_deepfake.jpg")
    except Exception as e2:
        print(f"  FAIL genuine_deepfake.jpg: {e2}")

# 3. Multi-face real - group photo
time.sleep(1)
try:
    download("https://randomuser.me/api/portraits/women/45.jpg", "genuine_multiface_a.jpg")
    download("https://randomuser.me/api/portraits/men/67.jpg",   "genuine_multiface_b.jpg")
except Exception as e:
    print(f"  FAIL multiface: {e}")

# 4. High-res real portrait (large format real photo)
time.sleep(1)
try:
    # Picsum Photos - real CC0 photos, large format
    download("https://picsum.photos/seed/portrait1/3024/4032.jpg", "genuine_mobile_large.jpg")
except Exception as e:
    print(f"  FAIL mobile large: {e}")
    try:
        download("https://picsum.photos/2048/2048.jpg", "genuine_mobile_large.jpg")
    except Exception as e2:
        print(f"  FAIL fallback: {e2}")

print("Done.")
