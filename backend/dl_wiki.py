import urllib.request, ssl, time, os
from PIL import Image

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# Wait for Wikipedia rate limit to clear then use correct URL
time.sleep(3)
hdrs = {"User-Agent":"RealNetraTest/1.0 (research@example.com)","Accept":"image/*"}

def try_dl(url, dest, min_kb=5):
    try:
        req = urllib.request.Request(url, headers=hdrs)
        with urllib.request.urlopen(req, context=ctx, timeout=30) as r:
            data = r.read()
        is_img = (len(data) >= min_kb*1024) and (data[:3] == b"\xff\xd8\xff" or data[:8] == b"\x89PNG\r\n\x1a\n")
        print(f"  [{r.status}] {len(data)//1024}KB img={is_img} {url[:75]}")
        if is_img:
            open(dest,"wb").write(data)
            return True
        return False
    except Exception as e:
        print(f"  [ERR] {url[:75]}: {e}")
        return False

# Wikipedia Commons - exact correct known URLs for GAN/deepfake images
# These are full-resolution commons images, not thumbnails
wiki_urls = [
    # This is the actual GAN celebrities image from the deepfakes Wikipedia article
    "https://upload.wikimedia.org/wikipedia/commons/4/45/GAN_Generated_Celebrities.jpg",
    # Deepfake example from the deepfake Wikipedia page
    "https://upload.wikimedia.org/wikipedia/commons/c/c8/Deepfake_example2.jpg",
    # StyleGAN sample face - Wikimedia Commons
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/GAN_Generated_Celebrities.jpg/640px-GAN_Generated_Celebrities.jpg",
    # Different approach - use commons API to get a known deepfake sample
    "https://commons.wikimedia.org/wiki/Special:FilePath/GAN_Generated_Celebrities.jpg",
]

for url in wiki_urls:
    if try_dl(url, "genuine_deepfake.jpg", min_kb=5):
        img = Image.open("genuine_deepfake.jpg")
        print(f"\nSUCCESS: {img.size} {img.mode} {os.path.getsize('genuine_deepfake.jpg')//1024}KB")
        break
    time.sleep(2)
else:
    print("Wikipedia also blocked.")
