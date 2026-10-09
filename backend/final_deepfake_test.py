import requests, time
from PIL import Image
import io, os

IMG_PATH = r"C:\Users\SACHIN MISHRA\.gemini\antigravity-ide\brain\20123308-562a-4977-8042-230e6caad472\.user_uploaded\media_1789124433164.jpg"
BASE = "https://deepfake-detector-1-8ay2.onrender.com"

# Read and check image
with open(IMG_PATH, "rb") as f:
    img_bytes = f.read()

img = Image.open(io.BytesIO(img_bytes))
print(f"Image: {img.size} {img.mode}  {len(img_bytes)//1024}KB")
print(f"Ground truth: DEEPFAKE (StyleGAN2-generated, user confirmed)")
print()

# Send to live Render API
print("Sending to live Render API...")
t0 = time.time()
resp = requests.post(
    f"{BASE}/api/detect",
    files={"file": ("deepfake_face.jpg", img_bytes, "image/jpeg")},
    timeout=90
)
elapsed = time.time() - t0

print(f"HTTP Status:   {resp.status_code}")
print(f"Response Time: {elapsed:.2f}s")
print()

if resp.status_code == 200:
    j = resp.json()
    verdict  = j.get("result", "?")
    conf     = j.get("confidence", "?")
    det      = j.get("details", {})
    real_p   = det.get("real_probability", "?")
    fake_p   = det.get("fake_probability", "?")
    faces    = det.get("faces_detected", "?")
    model    = det.get("model_used", "?")
    breakdown = det.get("forensic_breakdown", {})

    print(f"Final Classification: {verdict}")
    print(f"Final Confidence:     {conf}%")
    print(f"Real Probability:     {real_p}%")
    print(f"Fake Probability:     {fake_p}%  (ViT primary)")
    print(f"Faces Detected:       {faces}")
    print(f"Model Used:           {model}")
    print()
    print("Forensic Breakdown:")
    for k, v in breakdown.items():
        print(f"  {k}: {v}")
    print()
    match = "PASS - correctly identified as DEEPFAKE" if verdict == "DEEPFAKE" else "FAIL - incorrectly classified as REAL"
    print(f"Result vs Ground Truth: {match}")
else:
    print(f"ERROR: {resp.text[:400]}")
