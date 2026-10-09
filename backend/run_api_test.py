import requests, time

BASE = "https://deepfake-detector-1-8ay2.onrender.com"

tests = [
    ("REAL portrait",      "test_real.jpg",        "REAL"),
    ("DEEPFAKE synthetic", "test_fake.jpg",         "DEEPFAKE"),
    ("Multi-face REAL",    "test_multiface.jpg",    "REAL"),
    ("Large mobile image", "test_mobile_large.jpg", "REAL"),
]

print("=" * 70)
print("POST /api/detect - Production Tests against Render")
print("=" * 70)

for label, filename, expected in tests:
    with open(filename, "rb") as f:
        img_bytes = f.read()
    print(f"\n[TEST] {label}")
    print(f"  File:     {filename} ({len(img_bytes)/1024:.1f} KB)")
    print(f"  Expected: {expected}")
    t0 = time.time()
    try:
        resp = requests.post(
            f"{BASE}/api/detect",
            files={"file": (filename, img_bytes, "image/jpeg")},
            timeout=90
        )
        elapsed = time.time() - t0
        print(f"  Status:   {resp.status_code}  Time: {elapsed:.2f}s")
        if resp.status_code == 200:
            data = resp.json()
            result = data.get("result", "?")
            conf = data.get("confidence", "?")
            det = data.get("details", {})
            faces = det.get("faces_detected", "?")
            real_p = det.get("real_probability", "?")
            fake_p = det.get("fake_probability", "?")
            model = det.get("model_used", "?")
            match = "PASS" if result == expected else "FAIL"
            print(f"  Result:   {result} [{match}]")
            print(f"  Confidence: {conf}%")
            print(f"  Faces:    {faces}")
            print(f"  Real%:    {real_p}  Fake%: {fake_p}")
            print(f"  Model:    {model}")
        else:
            print(f"  ERROR {resp.status_code}: {resp.text[:300]}")
    except Exception as e:
        print(f"  EXCEPTION: {e}")

print()
print("=" * 70)
print("Tests complete.")
