import urllib.request, ssl, time, os
from PIL import Image

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
hdrs = {"User-Agent":"Mozilla/5.0 Chrome/120","Accept":"image/*,*/*"}

def try_dl(url, dest, min_kb=5):
    try:
        req = urllib.request.Request(url, headers=hdrs)
        with urllib.request.urlopen(req, context=ctx, timeout=25) as r:
            data = r.read()
        is_img = (len(data) >= min_kb*1024) and (data[:3] == b"\xff\xd8\xff" or data[:8] == b"\x89PNG\r\n\x1a\n")
        print(f"  [{r.status}] {len(data)//1024}KB img={is_img} {url[:70]}")
        if is_img:
            open(dest,"wb").write(data)
            return True
        return False
    except Exception as e:
        print(f"  [ERR] {url[:70]}: {e}")
        return False

# GitHub repos with sample deepfake images (public, no auth)
urls = [
    # FaceForensics++ paper sample faces
    "https://raw.githubusercontent.com/cc-hpc-itwm/DeepFakeDetection/master/imgs/deepfake_example.jpg",
    "https://raw.githubusercontent.com/dessa-oss/deepfake-detection/master/data/fake/fake_1.jpg",
    "https://raw.githubusercontent.com/aerdem4/kaggle-deepfake/master/data/sample.jpg",
    # Roboflow deepfake detection dataset previews
    "https://storage.googleapis.com/roboflow-platform-web/images/zjyG1E3mkv6LlsBMfhS4/undefined/FFHQ_sample_fake.jpg",
    # Wikipedia deepfake article media
    "https://upload.wikimedia.org/wikipedia/commons/a/a9/Deepfake_example2.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/4/45/GAN_Generated_Celebrities.jpg",
    # Pixabay/CC0 AI face sample
    "https://images.generated.photos/photos/5e680fe4-f8fa-4ec4-bd4b-b7e2a0d74fbc.jpg",
    # Known GitHub deepfake sample sets
    "https://raw.githubusercontent.com/yuezunli/WACVW2019/master/images/fake.png",
    "https://raw.githubusercontent.com/deepfakes/faceswap/master/docs/media/deepfake_dummy.jpg",
]

for url in urls:
    if try_dl(url, "genuine_deepfake.jpg", min_kb=5):
        img = Image.open("genuine_deepfake.jpg")
        print(f"\nSUCCESS: genuine_deepfake.jpg {img.size} {img.mode}")
        break
    time.sleep(0.2)
else:
    print("\nAll sources exhausted.")
