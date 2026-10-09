import urllib.request, ssl, time, os

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

hdrs = {"User-Agent": "Mozilla/5.0 Chrome/120", "Accept": "image/jpeg,image/*,*/*"}

def try_dl(url, dest):
    try:
        req = urllib.request.Request(url, headers=hdrs)
        with urllib.request.urlopen(req, context=ctx, timeout=20) as r:
            ct = r.headers.get("Content-Type","")
            data = r.read()
        is_img = "image" in ct or (len(data) > 3000 and data[:2] == b"\xff\xd8")
        print(f"  {url[:65]} [{r.status}] {ct} {len(data)//1024}KB img={is_img}")
        if is_img:
            open(dest,"wb").write(data)
            return True
    except Exception as e:
        print(f"  {url[:65]} ERROR: {e}")
    return False

# thispersondoesnotexist.com current known URLs
for url in [
    "https://thispersondoesnotexist.com/image",
    "https://www.thispersondoesnotexist.com/image",
    "https://thispersondoesnotexist.com/",
]:
    if try_dl(url, "genuine_deepfake.jpg"):
        break
    time.sleep(0.5)

# Also try generated.photos API (free GAN face API)
if not os.path.exists("genuine_deepfake.jpg") or os.path.getsize("genuine_deepfake.jpg") < 10000:
    for url in [
        "https://generated.photos/photos/5e680fe4-f8fa-4ec4-bd4b-b7e2a0d74fbc",
        "https://api.generated.photos/api/v1/faces?api_key=none&per_page=1",
    ]:
        if try_dl(url, "genuine_deepfake.jpg"):
            break
        time.sleep(0.5)

# Final check
from PIL import Image
if os.path.exists("genuine_deepfake.jpg"):
    try:
        img = Image.open("genuine_deepfake.jpg")
        print(f"\ngenuine_deepfake.jpg: {img.size} {img.mode} {os.path.getsize('genuine_deepfake.jpg')//1024}KB")
    except Exception as e:
        print(f"genuine_deepfake.jpg is not valid: {e}")
