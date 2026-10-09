import io
import os
from PIL import Image
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

print("=" * 70)
print("REALNETRA FULL MULTI-MODAL PIPELINE RECOGNITION TEST")
print("=" * 70)

test_files = [
    ("test_real.jpg", "Authentic Human Portrait", "REAL"),
    ("test_fake.jpg", "AI Spliced / Deepfake Synthetic Face", "DEEPFAKE"),
    ("test_multiface.jpg", "Multiple Real Human Faces", "REAL"),
    ("test_mobile_large.jpg", "Camera Photo (High Resolution)", "REAL")
]

for filename, description, expected in test_files:
    file_path = os.path.join(os.path.dirname(__file__), filename)
    if not os.path.exists(file_path):
        print(f"\n[SKIP] File not found: {filename}")
        continue

    with open(file_path, "rb") as f:
        img_bytes = f.read()

    response = client.post(
        "/api/detect",
        files={"file": (filename, img_bytes, "image/jpeg")}
    )

    if response.status_code == 200:
        data = response.json()
        verdict = data.get("result")
        confidence = data.get("confidence")
        details = data.get("details", {})
        
        real_p = details.get("real_probability")
        fake_p = details.get("fake_probability")
        faces = details.get("faces_detected")
        cropped = details.get("face_crop_applied")
        model_used = details.get("model_used")
        
        print(f"\nImage: {filename}")
        print(f"  Description: {description}")
        print(f"  Expected   : {expected}")
        print(f"  Verdict    : {verdict} [Confidence: {confidence}%]")
        print(f"  Probabilities: Real={real_p}% | Fake={fake_p}%")
        print(f"  Detected   : Faces={faces}, Crop={cropped}")
        print(f"  Model Used : {model_used}")
        
        match = (verdict == expected)
        print(f"  Result     : {'PASS [CORRECT RECOGNITION]' if match else 'FAIL'}")
    else:
        print(f"\nImage: {filename} - Error {response.status_code}: {response.text}")

print("\n" + "=" * 70)
