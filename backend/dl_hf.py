import urllib.request, ssl, time, os
from PIL import Image

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

hdrs = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
    "Accept": "image/jpeg,image/png,image/webp,image/*",
}

def try_dl(url, dest, min_kb=10):
    try:
        req = urllib.request.Request(url, headers=hdrs)
        with urllib.request.urlopen(req, context=ctx, timeout=25) as r:
            ct = r.headers.get("Content-Type","")
            data = r.read()
        is_img = (len(data) >= min_kb*1024) and (data[:3] == b"\xff\xd8\xff" or data[:8] == b"\x89PNG\r\n\x1a\n")
        print(f"  [{r.status}] {len(data)//1024}KB img={is_img} {url[:70]}")
        if is_img:
            open(dest, "wb").write(data)
            return True
        return False
    except Exception as e:
        print(f"  [ERR] {url[:70]}: {e}")
        return False

print("Trying HuggingFace deepfake dataset raw images...")

# HuggingFace datasets - FaceForensics++ or similar
hf_urls = [
    # Real GAN face samples from academic datasets mirrored on HF
    "https://huggingface.co/datasets/Competition/deepfake-detection/resolve/main/sample_fake.jpg",
    "https://huggingface.co/datasets/Competition/deepfake-detection/resolve/main/fake/fake_000.jpg",
    # Flickr Faces HQ - real reference, and their generated counterparts
    "https://huggingface.co/datasets/motheecreator/Deepfakes_and_Real_images/resolve/main/fake/fake001.png",
    "https://huggingface.co/datasets/motheecreator/Deepfakes_and_Real_images/resolve/main/fake/fake002.png",
    "https://huggingface.co/datasets/motheecreator/Deepfakes_and_Real_images/resolve/main/fake/1.png",
    "https://huggingface.co/datasets/motheecreator/Deepfakes_and_Real_images/resolve/main/Data/Test/Fake/1.png",
    "https://huggingface.co/datasets/OpenRL/deepfake-images/resolve/main/fake/00000.jpg",
    "https://huggingface.co/datasets/OpenRL/deepfake-images/resolve/main/test/fake/0.jpg",
    # 140K dataset used for training (dima806 model companion data)
    "https://huggingface.co/datasets/Chanikya/deepfake_vs_real_image_classification/resolve/main/test/fake/fake_0001.jpg",
]

for url in hf_urls:
    if try_dl(url, "genuine_deepfake.jpg", min_kb=10):
        img = Image.open("genuine_deepfake.jpg")
        print(f"\nDOWNLOADED: {img.size} {img.mode}")
        break
    time.sleep(0.3)
else:
    print("\nAll HuggingFace sources failed - trying direct known deepfake image CDNs")
    for url in [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Deepfake_example.gif/320px-Deepfake_example.gif",
        "https://images.squarespace-cdn.com/content/v1/5c3e70ae5b409b50a13a97c7/1560448487744-AAKQP3FPPLQNJ3WUAHKZ/deepfake.jpg",
    ]:
        if try_dl(url, "genuine_deepfake.jpg", min_kb=5):
            try:
                img = Image.open("genuine_deepfake.jpg")
                print(f"\nDOWNLOADED: {img.size} {img.mode}")
                break
            except:
                pass
