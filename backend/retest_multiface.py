import requests, time
BASE = "https://deepfake-detector-1-8ay2.onrender.com"
with open("test_multiface.jpg", "rb") as f:
    data = f.read()
print(f"Multi-face re-test: {len(data)/1024:.1f} KB")
t0 = time.time()
resp = requests.post(f"{BASE}/api/detect", files={"file": ("test_multiface.jpg", data, "image/jpeg")}, timeout=90)
elapsed = time.time() - t0
print(f"Status: {resp.status_code}  Time: {elapsed:.2f}s")
if resp.status_code == 200:
    j = resp.json()
    verdict = j.get("result", "?")
    conf = j.get("confidence", "?")
    det = j.get("details", {})
    real_p = det.get("real_probability", "?")
    fake_p = det.get("fake_probability", "?")
    faces = det.get("faces_detected", "?")
    print(f"Result: {verdict}  Confidence: {conf}%")
    print(f"Real%: {real_p}  Fake%: {fake_p}  Faces: {faces}")
else:
    print(f"ERROR: {resp.text[:300]}")
