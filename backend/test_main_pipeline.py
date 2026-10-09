import io
import os
import sys
from PIL import Image
from fastapi.testclient import TestClient

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(__file__))

from main import app

client = TestClient(app)

def create_synthetic_image(color=(128, 128, 128), size=(256, 256), fmt="JPEG"):
    buf = io.BytesIO()
    img = Image.new("RGB", size, color=color)
    img.save(buf, format=fmt)
    return buf.getvalue()

def test_health_check_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "model_loaded" in data
    assert "service" in data

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"

def test_invalid_file_format():
    response = client.post(
        "/api/detect",
        files={"file": ("test.txt", b"This is plain text payload", "text/plain")}
    )
    assert response.status_code == 400
    assert "Invalid file format" in response.json()["detail"]

def test_empty_file_upload():
    response = client.post(
        "/api/detect",
        files={"file": ("empty.jpg", b"", "image/jpeg")}
    )
    assert response.status_code == 400
    assert "empty" in response.json()["detail"]

def test_synthetic_no_face_image_detection():
    img_bytes = create_synthetic_image(color=(200, 100, 50), size=(300, 300))
    response = client.post(
        "/api/detect",
        files={"file": ("test_noface.jpg", img_bytes, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert "result" in data
    assert data["result"] in ["REAL", "DEEPFAKE", "INCONCLUSIVE", "UNCERTAIN"]
    assert "confidence" in data
    assert "details" in data
    assert data["details"]["faces_detected"] == 0
    assert data["details"]["face_crop_applied"] is False
    assert "methods_executed" in data["details"] or "analysis_methods" in data["details"]

def test_real_validation_sample():
    suite_dir = os.path.join(os.path.dirname(__file__), "..", "scratch", "real_test_suite", "real")
    if os.path.exists(suite_dir):
        files = [f for f in os.listdir(suite_dir) if f.endswith((".jpg", ".png"))]
        if files:
            sample_path = os.path.join(suite_dir, files[0])
            with open(sample_path, "rb") as f:
                img_bytes = f.read()
            response = client.post(
                "/api/detect",
                files={"file": (files[0], img_bytes, "image/jpeg")}
            )
            assert response.status_code == 200
            data = response.json()
            assert data["result"] in ["REAL", "DEEPFAKE", "INCONCLUSIVE"]
            assert "confidence" in data

def test_fake_validation_sample():
    suite_dir = os.path.join(os.path.dirname(__file__), "..", "scratch", "real_test_suite", "fake")
    if os.path.exists(suite_dir):
        files = [f for f in os.listdir(suite_dir) if f.endswith((".jpg", ".png"))]
        if files:
            sample_path = os.path.join(suite_dir, files[0])
            with open(sample_path, "rb") as f:
                img_bytes = f.read()
            response = client.post(
                "/api/detect",
                files={"file": (files[0], img_bytes, "image/jpeg")}
            )
            assert response.status_code == 200
            data = response.json()
            assert data["result"] in ["REAL", "DEEPFAKE", "INCONCLUSIVE"]
            assert "confidence" in data

if __name__ == "__main__":
    print("Running automated backend test suite...")
    test_health_check_endpoint()
    print("[OK] Health check endpoint passed.")
    test_root_endpoint()
    print("[OK] Root endpoint passed.")
    test_invalid_file_format()
    print("[OK] Invalid file format rejection passed.")
    test_empty_file_upload()
    print("[OK] Empty file upload rejection passed.")
    test_synthetic_no_face_image_detection()
    print("[OK] No-face image detection pipeline passed.")
    test_real_validation_sample()
    print("[OK] Real validation sample test passed.")
    test_fake_validation_sample()
    print("[OK] Fake validation sample test passed.")
    print("All automated backend unit & integration tests PASSED successfully!")
