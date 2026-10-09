import urllib.request, ssl, time, os
from PIL import Image
import io

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

hdrs = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    "Accept": "image/jpeg,image/webp,image/png,image/*,*/*;q=0.8",
}

def try_dl(url, dest, min_kb=20):
    try:
        req = urllib.request.Request(url, headers=hdrs)
        with urllib.request.urlopen(req, context=ctx, timeout=25) as r:
            ct = r.headers.get("Content-Type","")
            data = r.read()
        is_img = ("image" in ct and "html" not in ct) or (len(data) > min_kb*1024 and (data[:3] == b"\xff\xd8\xff" or data[:8] == b"\x89PNG\r\n\x1a\n"))
        print(f"  [{r.status}] {ct[:40]:40s} {len(data)//1024:5d}KB  img={is_img}  {url[:60]}")
        if is_img and len(data) >= min_kb*1024:
            open(dest, "wb").write(data)
            return True
        return False
    except Exception as e:
        print(f"  [ERR] {url[:60]}: {e}")
        return False

print("Trying StyleGAN3 / GAN deepfake image sources...")

success = False
# thispersonnotexist.org - generates & serves images directly
for url in [
    "https://thispersonnotexist.org/image",
    "https://www.thispersonnotexist.org/image",
    "https://api.thispersonnotexist.org/face",
]:
    if try_dl(url, "genuine_deepfake.jpg", min_kb=20):
        success = True
        break
    time.sleep(0.5)

# Alternatively - generated.photos has real API images
if not success:
    for url in [
        "https://generated.photos/photos/5e680fe4-f8fa-4ec4-bd4b-b7e2a0d74fbc.jpg",
        "https://cdn.generated.photos/apps/default-avatar/v4/photo/41/photo_41.jpg",
    ]:
        if try_dl(url, "genuine_deepfake.jpg", min_kb=20):
            success = True
            break
        time.sleep(0.5)

# Last resort: use a known deepfake sample from the FaceForensics++ dataset (GitHub raw)
if not success:
    for url in [
        "https://github.com/ondyari/FaceForensics/raw/master/dataset/FaceForensics.png",
    ]:
        if try_dl(url, "genuine_deepfake.jpg", min_kb=5):
            success = True
            break

print()
if success:
    img = Image.open("genuine_deepfake.jpg")
    print(f"genuine_deepfake.jpg ready: {img.size} {img.mode} {os.path.getsize('genuine_deepfake.jpg')//1024}KB")
else:
    print("Could not download a GAN deepfake face - reporting to user")
