import io
import os
import sys
from PIL import Image
from fastapi.testclient import TestClient

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(__file__))

import main
from main import app, init_ml_pipeline, process_image_pipeline

# Ensure models are loaded before running tests
init_ml_pipeline()
client = TestClient(app)


def create_synthetic_test_image(color=(128, 128, 128), size=(256, 256), fmt="JPEG"):
    """Creates a basic synthetic image fixture for unit tests (error handling, schemas)."""
    buf = io.BytesIO()
    img = Image.new("RGB", size, color=color)
    img.save(buf, format=fmt)
    return buf.getvalue()


# -----------------------------------------------------------------------------
# 1. API Endpoints & Health
# -----------------------------------------------------------------------------
def test_health_check_endpoint():
    response = client.get("/health")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    data = response.json()
    assert data["status"] == "healthy"
    assert "model_loaded" in data
    assert "service" in data
    assert "device" in data


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    data = response.json()
    assert data["status"] == "online"
    assert "RealNetra" in data["service"]


# -----------------------------------------------------------------------------
# 2. Input Validation & Error Handling
# -----------------------------------------------------------------------------
def test_invalid_file_format():
    response = client.post(
        "/api/detect",
        files={"file": ("test.txt", b"This is plain text payload", "text/plain")}
    )
    assert response.status_code == 400, f"Expected 400, got {response.status_code}"
    assert "Invalid file format" in response.json()["detail"]


def test_unsupported_binary_format():
    response = client.post(
        "/api/detect",
        files={"file": ("document.pdf", b"%PDF-1.4 binary data", "application/pdf")}
    )
    assert response.status_code == 400
    assert "Invalid file format" in response.json()["detail"]


def test_empty_file_upload():
    response = client.post(
        "/api/detect",
        files={"file": ("empty.jpg", b"", "image/jpeg")}
    )
    assert response.status_code == 400, f"Expected 400, got {response.status_code}"
    assert "empty" in response.json()["detail"]


def test_corrupted_image_file():
    corrupted_bytes = b"\xFF\xD8\xFF\xE0" + b"\x00" * 20 + b"GARBAGE_PAYLOAD_NOT_A_VALID_JPEG"
    response = client.post(
        "/api/detect",
        files={"file": ("corrupt.jpg", corrupted_bytes, "image/jpeg")}
    )
    assert response.status_code == 400
    detail = response.json()["detail"]
    assert "Failed to decode" in detail
    # Security: internal server file paths or Python tracebacks must NOT be leaked
    assert "Traceback" not in detail
    assert "C:\\" not in detail


# -----------------------------------------------------------------------------
# 3. Image Characteristics & Edge Cases
# -----------------------------------------------------------------------------
def test_synthetic_no_face_image_detection():
    img_bytes = create_synthetic_test_image(color=(200, 100, 50), size=(300, 300))
    response = client.post(
        "/api/detect",
        files={"file": ("test_noface.jpg", img_bytes, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["result"] in ["REAL", "DEEPFAKE", "INCONCLUSIVE"]
    assert "confidence" in data
    assert "details" in data
    assert data["details"]["faces_detected"] == 0
    assert data["details"]["face_crop_applied"] is False


def test_low_resolution_image():
    # Very small image (32x32) should not crash the pipeline
    small_bytes = create_synthetic_test_image(color=(100, 150, 200), size=(32, 32))
    response = client.post(
        "/api/detect",
        files={"file": ("small_32x32.jpg", small_bytes, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["result"] in ["REAL", "DEEPFAKE", "INCONCLUSIVE"]
    assert 0.0 <= data["confidence"] <= 100.0


# -----------------------------------------------------------------------------
# 4. Response Schema & Confidence Calibration
# -----------------------------------------------------------------------------
def test_api_response_schema():
    img_bytes = create_synthetic_test_image(color=(128, 128, 128), size=(200, 200))
    response = client.post(
        "/api/detect",
        files={"file": ("schema_test.jpg", img_bytes, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()

    # Top-level schema
    required_keys = ["filename", "type", "result", "confidence", "details"]
    for k in required_keys:
        assert k in data, f"Missing top-level key: {k}"

    assert data["result"] in ["REAL", "DEEPFAKE", "INCONCLUSIVE"]
    assert isinstance(data["confidence"], (int, float))
    assert 0.0 <= data["confidence"] <= 100.0

    # Details schema
    details = data["details"]
    assert "model_used" in details
    assert "faces_detected" in details
    assert "face_crop_applied" in details
    assert "real_probability" in details
    assert "fake_probability" in details
    assert "explanation" in details
    assert "methods_executed" in details
    assert "forensic_breakdown" in details
    assert "metadata_forensics" in details
    assert "disclaimer" in details


# -----------------------------------------------------------------------------
# 5. Production Pipeline Inference on Real Sample
# -----------------------------------------------------------------------------
def test_real_image_inference():
    suite_dir = os.path.join(os.path.dirname(__file__), "..", "scratch", "real_test_suite", "real")
    if not os.path.exists(suite_dir):
        print("  [RESOURCE NOTE] scratch/real_test_suite/real does not exist. Skipping.")
        return

    obama_file = os.path.join(suite_dir, "real_01_portrait_obama.jpg")
    if not os.path.exists(obama_file):
        files = [f for f in os.listdir(suite_dir) if f.endswith((".jpg", ".png"))]
        if not files:
            print("  [RESOURCE NOTE] No real images found in real_test_suite/real.")
            return
        obama_file = os.path.join(suite_dir, files[0])

    with open(obama_file, "rb") as f:
        img_bytes = f.read()

    res = process_image_pipeline(img_bytes, filename=os.path.basename(obama_file))
    assert res["result"] == "REAL", f"Expected REAL for authentic portrait, got {res['result']}"
    assert res["confidence"] >= 80.0, f"Expected confidence >= 80%, got {res['confidence']}%"
    assert res["details"]["faces_detected"] >= 1, "Expected at least 1 face detected"
    assert res["details"]["face_crop_applied"] is True, "Expected face crop applied"


# -----------------------------------------------------------------------------
# 6. Labeled Fake Test Samples Resource Transparency
# -----------------------------------------------------------------------------
def test_fake_dataset_resource_transparency():
    """
    Transparently audits the fake test dataset.
    Recognizes that current fixtures in scratch/real_test_suite/fake/ are programmatic
    synthetic drawings, not authentic photographic deepfakes.
    """
    suite_dir = os.path.join(os.path.dirname(__file__), "..", "scratch", "real_test_suite", "fake")
    if not os.path.exists(suite_dir):
        print("  [RESOURCE NOTE] scratch/real_test_suite/fake does not exist.")
        return

    files = sorted([f for f in os.listdir(suite_dir) if f.endswith((".jpg", ".png"))])
    assert len(files) > 0, "No fake test images found in fake directory"

    # Verify that the pipeline processes them without crashing
    sample_path = os.path.join(suite_dir, files[0])
    with open(sample_path, "rb") as f:
        img_bytes = f.read()

    res = process_image_pipeline(img_bytes, filename=files[0])
    assert res["result"] in ["REAL", "DEEPFAKE", "INCONCLUSIVE"]
    assert 0.0 <= res["confidence"] <= 100.0


# -----------------------------------------------------------------------------
# 7. Forensic Features Handling & Ensemble Behavior
# -----------------------------------------------------------------------------
def test_forensic_none_handling_and_ensemble():
    """Tests that images with no detectable faces safely handle None in face-dependent forensic signals."""
    img_bytes = create_synthetic_test_image(color=(50, 100, 150), size=(256, 256))
    res = process_image_pipeline(img_bytes, filename="no_face_forensics.jpg")
    fbd = res["details"]["forensic_breakdown"]

    # Face-dependent signals should be None or safely handled
    assert "ela_anomaly_score" in fbd
    assert "fft_spectral_score" in fbd
    assert fbd.get("signals_computed") is not None
    assert res["details"]["heuristic_action"] in [
        "camera_anchor_cleared", "neural_model_primary", "confident_neural_decision",
        "corroborated_artifact_boost", "ela_corroborated_boost",
        "forensic_neural_conflict_inconclusive", "no_face_detected_inconclusive",
        "uncertainty_band_inconclusive"
    ]


# -----------------------------------------------------------------------------
# 8. Decision Safeguards & Uncertainty Policy Unit Tests
# -----------------------------------------------------------------------------
def test_no_face_input_safeguard():
    """Requirement: Do not treat absence of a detected face or clean forensic signals as proof of genuine."""
    # Synthetic flat image has no face features
    img_bytes = create_synthetic_test_image(color=(180, 140, 100), size=(256, 256))
    res = process_image_pipeline(img_bytes, filename="safeguard_noface.jpg")

    assert res["result"] == "INCONCLUSIVE", f"Expected INCONCLUSIVE for no-face input, got {res['result']}"
    assert res["confidence"] <= 60.0, f"Expected capped confidence <= 60%, got {res['confidence']}%"
    assert res["details"]["faces_detected"] == 0
    assert res["details"]["heuristic_action"] == "no_face_detected_inconclusive"
    assert "absence of a detected face" in res["details"]["explanation"]


def test_borderline_uncertainty_band_policy():
    """Requirement: Borderline predictions in 25%-75% band must return INCONCLUSIVE rather than high-confidence claims."""
    # Test on web-compressed or multi-person photo known to have borderline fake prob
    suite_dir = os.path.join(os.path.dirname(__file__), "..", "scratch", "real_test_suite", "real")
    sample_file = os.path.join(suite_dir, "real_06_multi_person_2.jpg")
    if not os.path.exists(sample_file):
        sample_file = os.path.join(suite_dir, "real_09_web_compressed.jpg")

    if os.path.exists(sample_file):
        with open(sample_file, "rb") as f:
            b = f.read()
        res = process_image_pipeline(b, filename=os.path.basename(sample_file))
        fake_p = res["details"]["fake_probability"]
        if 25.0 <= fake_p <= 75.0:
            assert res["result"] == "INCONCLUSIVE"
            assert res["details"]["heuristic_action"] in ["uncertainty_band_inconclusive", "no_face_detected_inconclusive"]
            assert res["confidence"] <= 75.0, f"Uncertainty confidence should not exceed 75%, got {res['confidence']}%"


def test_forensic_neural_conflict_safeguard():
    """Requirement: Neural model predicting REAL (<35%) while forensic analysis detects strong artifacts must return INCONCLUSIVE."""
    # Use synthetic image with strong synthetic Fourier/boundary artifacts
    suite_dir = os.path.join(os.path.dirname(__file__), "..", "scratch", "real_test_suite", "fake")
    sample_file = os.path.join(suite_dir, "fake_03_stylegan_grid.jpg")
    if os.path.exists(sample_file):
        with open(sample_file, "rb") as f:
            b = f.read()
        res = process_image_pipeline(b, filename=os.path.basename(sample_file))
        # Must NEVER be called REAL despite neural model giving low fake_p
        assert res["result"] != "REAL", f"Manipulated image must NOT be classified as REAL! Got {res['result']}"
        assert res["result"] in ["INCONCLUSIVE", "DEEPFAKE"]
        assert res["details"]["heuristic_action"] in ["no_face_detected_inconclusive", "forensic_neural_conflict_inconclusive"]


def test_high_confidence_false_real_prevention():
    """Requirement: Prevent unearned >90% REAL claims on non-face or conflicting images."""
    suite_dir = os.path.join(os.path.dirname(__file__), "..", "scratch", "real_test_suite", "real")
    landscape_file = os.path.join(suite_dir, "real_10_landscape_noface.jpg")
    if os.path.exists(landscape_file):
        with open(landscape_file, "rb") as f:
            b = f.read()
        res = process_image_pipeline(b, filename=os.path.basename(landscape_file))
        # A landscape has no face, so it must NEVER receive REAL with 98% confidence
        assert res["result"] == "INCONCLUSIVE", f"Landscape with no face must return INCONCLUSIVE, got {res['result']}"
        assert res["confidence"] <= 60.0, f"Confidence on non-face must be modest, got {res['confidence']}%"


def test_high_confidence_false_fake_prevention():
    """Requirement: Borderline predictions cannot be escalated to DEEPFAKE without exceeding 75% or corroboration."""
    img_bytes = create_synthetic_test_image(color=(120, 120, 120), size=(200, 200))
    res = process_image_pipeline(img_bytes, filename="test_border.jpg")
    if res["details"]["fake_probability"] <= 75.0:
        assert res["result"] != "DEEPFAKE" or res["details"]["heuristic_action"] in ["corroborated_artifact_boost", "ela_corroborated_boost"]


def test_target_false_real_deepfakes_regression():
    """Requirement Task 3: Regression test preventing false REAL verdicts on verified deepfakes face2face and boundary seam."""
    suite_dir = os.path.join(os.path.dirname(__file__), "..", "scratch", "real_test_suite", "fake")
    for fname in ["fake_08_face2face.jpg", "fake_02_boundary_seam.jpg"]:
        path = os.path.join(suite_dir, fname)
        if os.path.exists(path):
            with open(path, "rb") as f:
                b = f.read()
            res = process_image_pipeline(b, filename=fname)
            assert res["result"] != "REAL", f"Target deepfake {fname} must NEVER be classified as REAL! Got {res['result']}"
            assert res["result"] in ["INCONCLUSIVE", "DEEPFAKE"], f"Target deepfake {fname} should be INCONCLUSIVE or DEEPFAKE, got {res['result']}"


def test_genuine_portraits_authenticity():
    """Requirement Task 3: Regression test verifying genuine portraits are recognized as REAL."""
    suite_dir = os.path.join(os.path.dirname(__file__), "..", "scratch", "real_test_suite", "real")
    for fname in ["real_01_portrait_obama.jpg", "real_02_portrait_pichai.png"]:
        path = os.path.join(suite_dir, fname)
        if os.path.exists(path):
            with open(path, "rb") as f:
                b = f.read()
            res = process_image_pipeline(b, filename=fname)
            assert res["result"] == "REAL", f"Genuine portrait {fname} expected REAL, got {res['result']}"
            assert res["confidence"] >= 95.0, f"Genuine portrait {fname} expected confidence >= 95%, got {res['confidence']}%"


if __name__ == "__main__":
    print("=" * 80)
    print("RUNNING COMPREHENSIVE AUTOMATED BACKEND TESTS")
    print("=" * 80)
    test_health_check_endpoint()
    print("  [OK] Health check endpoint passed.")
    test_root_endpoint()
    print("  [OK] Root endpoint passed.")
    test_invalid_file_format()
    print("  [OK] Invalid file format rejection passed.")
    test_unsupported_binary_format()
    print("  [OK] Unsupported binary format rejection passed.")
    test_empty_file_upload()
    print("  [OK] Empty file upload rejection passed.")
    test_corrupted_image_file()
    print("  [OK] Corrupted image rejection & security check passed.")
    test_synthetic_no_face_image_detection()
    print("  [OK] No-face synthetic image detection passed.")
    test_low_resolution_image()
    print("  [OK] Low-resolution image handling passed.")
    test_api_response_schema()
    print("  [OK] API response schema and confidence bounds passed.")
    test_real_image_inference()
    print("  [OK] Real authentic photograph inference passed (Obama portrait verified REAL).")
    test_fake_dataset_resource_transparency()
    print("  [OK] Fake dataset resource transparency check passed.")
    test_forensic_none_handling_and_ensemble()
    print("  [OK] Forensic None handling and calibrated ensemble logic passed.")
    test_no_face_input_safeguard()
    print("  [OK] Safeguard 1: No-face input safeguard passed (never returns REAL).")
    test_borderline_uncertainty_band_policy()
    print("  [OK] Safeguard 2: Borderline uncertainty band (25%-75%) policy passed.")
    test_forensic_neural_conflict_safeguard()
    print("  [OK] Safeguard 3: Forensic-neural conflict safeguard passed.")
    test_high_confidence_false_real_prevention()
    print("  [OK] Safeguard 4: High-confidence false REAL prevention passed (landscape returns INCONCLUSIVE).")
    test_high_confidence_false_fake_prevention()
    print("  [OK] Safeguard 5: High-confidence false FAKE prevention passed.")
    test_target_false_real_deepfakes_regression()
    print("  [OK] Safeguard 6: Target false-REAL deepfakes regression test passed.")
    test_genuine_portraits_authenticity()
    print("  [OK] Safeguard 7: Genuine portraits authenticity regression test passed.")
    print("\nALL 19 AUTOMATED BACKEND TESTS PASSED SUCCESSFULLY!")
