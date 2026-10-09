import requests, time

BASE = "https://deepfake-detector-1-8ay2.onrender.com"

# First check root still works
t0 = time.time()
r = requests.get(f"{BASE}/", timeout=30)
print(f"GET / -> {r.status_code} ({time.time()-t0:.2f}s): {r.text[:120]}")
print()

tests = [
    ("REAL portrait",               "test_real.jpg",         "REAL"),
    ("DEEPFAKE synthetic",           "test_fake.jpg",         "DEEPFAKE"),
    ("Multi-face REAL",              "test_multiface.jpg",    "REAL"),
    ("Large mobile 3024x4032",       "test_mobile_large.jpg", "REAL"),
]

print("=" * 70)
print("POST /api/detect -- LIVE Render test after commit 32fe445 (max_dim=768)")
print("=" * 70)

results = []
for label, fn, expected in tests:
    with open(fn, "rb") as f:
        data = f.read()
    print(f"\n[TEST] {label}")
    print(f"  File: {fn} ({len(data)/1024:.1f} KB)")
    t0 = time.time()
    try:
        resp = requests.post(
            f"{BASE}/api/detect",
            files={"file": (fn, data, "image/jpeg")},
            timeout=90
        )
        elapsed = time.time() - t0
        print(f"  Status: {resp.status_code}  Time: {elapsed:.2f}s")
        if resp.status_code == 200:
            j = resp.json()
            verdict = j.get("result", "?")
            conf    = j.get("confidence", "?")
            det     = j.get("details", {})
            real_p  = det.get("real_probability", "?")
            fake_p  = det.get("fake_probability", "?")
            faces   = det.get("faces_detected", "?")
            model   = det.get("model_used", "?")
            match   = "PASS" if verdict == expected else "FAIL (note: synthetic PIL may differ)"
            print(f"  Result:     {verdict} [{match}]")
            print(f"  Confidence: {conf}%")
            print(f"  Real%:      {real_p}  Fake%: {fake_p}")
            print(f"  Faces:      {faces}")
            print(f"  Model:      {model}")
            results.append((label, resp.status_code, elapsed, verdict, expected, conf))
        else:
            print(f"  ERROR: {resp.status_code} -- {resp.text[:300]}")
            results.append((label, resp.status_code, elapsed, "ERROR", expected, 0))
    except requests.exceptions.Timeout:
        print(f"  TIMEOUT after {time.time()-t0:.0f}s")
        results.append((label, "TIMEOUT", time.time()-t0, "TIMEOUT", expected, 0))
    except Exception as e:
        print(f"  EXCEPTION: {e}")
        results.append((label, "EX", 0, str(e), expected, 0))

print()
print("=" * 70)
print("SUMMARY")
print("=" * 70)
for label, code, t, verdict, exp, conf in results:
    status = "OK" if code == 200 else "FAIL"
    print(f"  [{status}] {code} {t:.1f}s  {verdict:10s}  {label}")
print("=" * 70)
