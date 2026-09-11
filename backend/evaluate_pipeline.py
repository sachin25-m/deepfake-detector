"""
RealNetra Deepfake Detection Pipeline Evaluation Suite
======================================================
Automated benchmark evaluating the production inference pipeline on diverse image types:
1. Genuine Camera Photos (With rich camera EXIF tags)
2. Genuine Internet Images (EXIF stripped, web compressed)
3. Genuine Screenshots (PNG/JPEG format, clean pixel grid)
4. Genuine Compressed Images (Various JPEG quality levels: 50, 70, 90)
5. Known Manipulated / Deepfake Face Swaps (Blending seams, ELA discrepancies)
6. Synthetic / AI-Generated Images (GAN grid & high frequency spectral artifacts)

Calculates:
- Confusion Matrix (TP, FP, TN, FN)
- Accuracy, Precision, Recall, F1-Score
- False Positive Rate (FPR) & False Negative Rate (FNR)
- Breakdown by image source/metadata condition
"""

import io
import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
from scipy import ndimage
import piexif
from detector_engine import detector_instance


def create_synthetic_camera_exif():
    """Generates authentic-looking camera EXIF metadata dictionary bytes."""
    zeroth_ifd = {
        piexif.ImageIFD.Make: u"Apple",
        piexif.ImageIFD.Model: u"iPhone 15 Pro",
        piexif.ImageIFD.Software: u"17.4.1",
        piexif.ImageIFD.DateTime: u"2026:04:15 14:23:05"
    }
    exif_ifd = {
        piexif.ExifIFD.ExposureTime: (1, 120),
        piexif.ExifIFD.FNumber: (18, 10),
        piexif.ExifIFD.ISOSpeedRatings: 100,
        piexif.ExifIFD.FocalLength: (24, 1),
    }
    exif_dict = {"0th": zeroth_ifd, "Exif": exif_ifd, "GPS": {}, "1st": {}, "thumbnail": None}
    return piexif.dump(exif_dict)


def generate_face_image(seed=42, is_manipulated=False, is_ai_synth=False, size=(512, 512)):
    """
    Generates a realistic facial test image.
    If is_manipulated=True, introduces localized blend seams, lighting mismatch, and ELA discrepancies.
    If is_ai_synth=True, introduces high-frequency Fourier grid artifacts.
    """
    np.random.seed(seed)
    w, h = size
    
    base = np.zeros((h, w, 3), dtype=np.float32)
    # Background texture
    base[:, :, 0] = np.random.normal(180, 10, (h, w))
    base[:, :, 1] = np.random.normal(195, 10, (h, w))
    base[:, :, 2] = np.random.normal(210, 10, (h, w))
    
    # Face skin texture
    cx, cy = w // 2, h // 2
    y_grid, x_grid = np.ogrid[:h, :w]
    face_mask = ((x_grid - cx)**2 / (w * 0.22)**2 + (y_grid - cy)**2 / (h * 0.28)**2) <= 1.0
    
    # Photographic skin pores texture
    skin_noise = np.random.normal(0, 10, (h, w, 3))
    skin_color = np.array([215.0, 175.0, 150.0], dtype=np.float32)
    
    base[face_mask] = skin_color + skin_noise[face_mask]
    
    if is_manipulated:
        # Splicing anomaly: face swap region transferred from a compressed source
        inner_mask = ((x_grid - cx)**2 / (w * 0.14)**2 + (y_grid - cy)**2 / (h * 0.18)**2) <= 1.0
        
        # 1. Base background compressed at Q95 (clean original photo background)
        bg_pil = Image.fromarray(np.uint8(np.clip(base, 0, 255)))
        buf_bg = io.BytesIO()
        bg_pil.save(buf_bg, format="JPEG", quality=95)
        buf_bg.seek(0)
        base = np.array(Image.open(buf_bg), dtype=np.float32)
        
        # 2. Spliced face patch: altered color balance + noise + compressed at Q50
        patch = base.copy()
        patch[inner_mask] = patch[inner_mask] * np.array([1.25, 0.82, 1.18]) + np.random.normal(0, 35, (h, w, 3))[inner_mask]
        patch_pil = Image.fromarray(np.uint8(np.clip(patch, 0, 255)))
        buf_patch = io.BytesIO()
        patch_pil.save(buf_patch, format="JPEG", quality=50)
        buf_patch.seek(0)
        patch_np = np.array(Image.open(buf_patch), dtype=np.float32)
        
        # 3. Composite spliced face patch into clean background
        base[inner_mask] = patch_np[inner_mask]
        border_mask = (face_mask & ~inner_mask)
        base[border_mask] = base[border_mask] + np.random.normal(0, 45, (h, w, 3))[border_mask]

    if is_ai_synth:
        # High-frequency spectral checkerboard artifact (diffusion / GAN upsampling)
        fx = np.sin(np.linspace(0, 64 * np.pi, w))[:, None]
        fy = np.cos(np.linspace(0, 64 * np.pi, h))[None, :]
        grid = (fx * fy)[:, :, None] * 35.0
        base = base + grid
        
    img_np = np.uint8(np.clip(base, 0, 255))
    return Image.fromarray(img_np)



def build_evaluation_dataset():
    """
    Constructs a calibrated evaluation test suite spanning 6 realistic test classes.
    Uses generic neutral file names to verify 100% metadata/filename independent classification.
    """
    samples = []
    
    # 1. Genuine Camera Photos (With EXIF metadata) - Label: REAL
    for i in range(4):
        img = generate_face_image(seed=100 + i, is_manipulated=False, is_ai_synth=False)
        buf = io.BytesIO()
        exif_bytes = create_synthetic_camera_exif()
        img.save(buf, format="JPEG", quality=95, exif=exif_bytes)
        samples.append({
            "name": f"img_camera_{i+1}.jpg",
            "category": "Camera Photo (EXIF Included)",
            "ground_truth": "REAL",
            "bytes": buf.getvalue()
        })
        
    # 2. Genuine Internet Images (EXIF stripped / Web compressed) - Label: REAL
    for i in range(4):
        img = generate_face_image(seed=200 + i, is_manipulated=False, is_ai_synth=False)
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=82) # Stripped EXIF
        samples.append({
            "name": f"img_web_{i+1}.jpg",
            "category": "Internet Image (EXIF Stripped)",
            "ground_truth": "REAL",
            "bytes": buf.getvalue()
        })
        
    # 3. Genuine Screenshots (PNG format) - Label: REAL
    for i in range(4):
        img = generate_face_image(seed=300 + i, is_manipulated=False, is_ai_synth=False)
        buf = io.BytesIO()
        img.save(buf, format="PNG") # PNG format without EXIF
        samples.append({
            "name": f"img_screen_{i+1}.png",
            "category": "Screenshot (PNG)",
            "ground_truth": "REAL",
            "bytes": buf.getvalue()
        })
        
    # 4. Genuine Compressed Images (Quality 55 & 70) - Label: REAL
    for i in range(4):
        img = generate_face_image(seed=400 + i, is_manipulated=False, is_ai_synth=False)
        buf = io.BytesIO()
        q = 55 if i % 2 == 0 else 70
        img.save(buf, format="JPEG", quality=q)
        samples.append({
            "name": f"img_comp_q{q}_{i+1}.jpg",
            "category": "Compressed Web Image",
            "ground_truth": "REAL",
            "bytes": buf.getvalue()
        })
        
    # 5. Known Deepfake Face Swaps (Splicing, boundary seam, ELA mismatch) - Label: DEEPFAKE
    for i in range(8):
        img = generate_face_image(seed=500 + i, is_manipulated=True, is_ai_synth=False)
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=88)
        samples.append({
            "name": f"img_portrait_{i+1}.jpg",
            "category": "Manipulated Deepfake Face",
            "ground_truth": "DEEPFAKE",
            "bytes": buf.getvalue()
        })
        
    # 6. AI-Generated Synthetic Faces (GAN/Diffusion upsampling frequency artifacts) - Label: DEEPFAKE
    for i in range(6):
        img = generate_face_image(seed=600 + i, is_manipulated=False, is_ai_synth=True)
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=90)
        samples.append({
            "name": f"img_render_{i+1}.jpg",
            "category": "AI-Generated Synthetic",
            "ground_truth": "DEEPFAKE",
            "bytes": buf.getvalue()
        })
        
    return samples


def run_benchmark():
    print("=" * 80)
    print("RUNNING REALNETRA DEEPFAKE DETECTION PRODUCTION BENCHMARK")
    print("=" * 80)
    
    import main
    import torch
    print("Initializing Vision Transformer & Face Detector for evaluation...")
    if "model" not in main.ml_models:
        model_path = main.LOCAL_MODEL_DIR if (os.path.exists(main.LOCAL_MODEL_DIR) and os.path.exists(os.path.join(main.LOCAL_MODEL_DIR, "config.json"))) else main.MODEL_NAME
        print(f"Loading ViT evaluation model from: {model_path}")
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        main.ml_models["processor"] = main.AutoImageProcessor.from_pretrained(model_path, local_files_only=os.path.exists(main.LOCAL_MODEL_DIR))
        model = main.AutoModelForImageClassification.from_pretrained(model_path, local_files_only=os.path.exists(main.LOCAL_MODEL_DIR))
        model.to(device)
        model.eval()
        main.ml_models["model"] = model
        main.ml_models["device"] = device
        main.ml_models["model_source"] = f"Fine-Tuned ViT ({model_path})"
    if "face_cascade" not in main.ml_models:
        import cv2
        main.ml_models["face_cascade"] = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        
    samples = build_evaluation_dataset()
    print(f"Loaded {len(samples)} diverse test samples across 6 distinct categories.\n")
    
    tp = 0 # Predicted DEEPFAKE, Ground Truth DEEPFAKE
    fp = 0 # Predicted DEEPFAKE, Ground Truth REAL (False Positive!)
    tn = 0 # Predicted REAL, Ground Truth REAL
    fn = 0 # Predicted REAL, Ground Truth DEEPFAKE (False Negative)
    
    results = []
    
    print(f"{'Sample File':<24} | {'Category':<28} | {'Ground Truth':<10} | {'Prediction':<10} | {'Conf':<6} | {'Status'}")
    print("-" * 100)
    
    for s in samples:
        pil_img = Image.open(io.BytesIO(s["bytes"])).convert("RGB")
        
        # 1. Forensic Engine Analysis
        forensic_res = detector_instance.analyze_image(s["bytes"], filename=s["name"])
        forensic_p_fake = forensic_res.get("probability_deepfake", 0.10) * 100.0
        
        # 2. Vision Transformer Inference (Full Image)
        vit_fake_p = 0.0
        vit_real_p = 100.0
        face_count = 0
        is_cropped = False
        
        if "model" in main.ml_models:
            if "face_cascade" in main.ml_models:
                cropped_img, face_count, is_cropped = main.detect_and_crop_face(pil_img, main.ml_models["face_cascade"])
            else:
                cropped_img, face_count, is_cropped = pil_img, 0, False

            target_img = cropped_img if face_count > 0 else pil_img
            _, _, full_real_p, full_fake_p, _ = main.run_model_inference(target_img)
            vit_fake_p = full_fake_p
            vit_real_p = full_real_p

        # 3. Multi-Modal Fusion: ViT Primary Classifier & Forensic Anomaly Fusion
        if forensic_res is not None:
            forensic_p_fake = forensic_res.get("probability_deepfake", 0.10) * 100.0
            if vit_fake_p >= 50.0:
                combined_fake_p = max(vit_fake_p, 0.70 * vit_fake_p + 0.30 * forensic_p_fake)
            elif forensic_p_fake >= 60.0:
                combined_fake_p = 0.20 * vit_fake_p + 0.80 * forensic_p_fake
            elif forensic_p_fake >= 45.0:
                combined_fake_p = 0.40 * vit_fake_p + 0.60 * forensic_p_fake
            else:
                combined_fake_p = 0.85 * vit_fake_p + 0.15 * forensic_p_fake
        else:
            combined_fake_p = vit_fake_p

        combined_real_p = round(100.0 - combined_fake_p, 2)
        combined_fake_p = round(combined_fake_p, 2)
        
        # Calibrated decision threshold at 50.0%
        pred = "DEEPFAKE" if combined_fake_p >= 50.0 else "REAL"
        conf = max(combined_real_p, combined_fake_p)
        gt = s["ground_truth"]
        
        is_correct = (pred == gt)
        if gt == "DEEPFAKE":
            if pred == "DEEPFAKE":
                tp += 1
            else:
                fn += 1
        else: # gt == REAL
            if pred == "REAL":
                tn += 1
            else:
                fp += 1
                
        status_str = "PASS [OK]" if is_correct else "FAIL [X]"
        print(f"{s['name']:<24} | {s['category']:<28} | {gt:<10} | {pred:<10} | {conf:>5.1f}% | {status_str}")
        
        results.append({
            **s,
            "prediction": pred,
            "confidence": conf,
            "correct": is_correct
        })
        
    total = len(samples)
    accuracy = (tp + tn) / total
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
    fpr = fp / (fp + tn) if (fp + tn) > 0 else 0.0
    fnr = fn / (fn + tp) if (fn + tp) > 0 else 0.0
    
    print("\n" + "=" * 80)
    print("EVALUATION BENCHMARK RESULTS")
    print("=" * 80)
    print(f"Total Evaluated Samples : {total}")
    print(f"True Positives (TP)     : {tp} (Deepfakes correctly caught)")
    print(f"True Negatives (TN)     : {tn} (Authentic images correctly cleared)")
    print(f"False Positives (FP)    : {fp} (Authentic images wrongly flagged as deepfake)")
    print(f"False Negatives (FN)    : {fn} (Deepfakes missed)")
    print("-" * 80)
    print(f"Accuracy                : {accuracy * 100:.2f}%")
    print(f"Precision               : {precision * 100:.2f}%")
    print(f"Recall                  : {recall * 100:.2f}%")
    print(f"F1-Score                : {f1 * 100:.2f}%")
    print(f"False Positive Rate(FPR): {fpr * 100:.2f}%")
    print(f"False Negative Rate(FNR): {fnr * 100:.2f}%")
    print("=" * 80)
    
    # Category summary
    categories = sorted(list(set(s["category"] for s in samples)))
    print("\nCATEGORY-BY-CATEGORY BREAKDOWN:")
    print(f"{'Category':<32} | {'Total':<6} | {'Correct':<8} | {'Accuracy':<10}")
    print("-" * 62)
    for cat in categories:
        cat_samples = [r for r in results if r["category"] == cat]
        cat_correct = sum(1 for r in cat_samples if r["correct"])
        cat_acc = cat_correct / len(cat_samples) * 100.0
        print(f"{cat:<32} | {len(cat_samples):<6} | {cat_correct:<8} | {cat_acc:>6.1f}%")
    print("=" * 80)

    return {
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "fpr": fpr,
        "fnr": fnr,
        "confusion_matrix": {"TP": tp, "FP": fp, "TN": tn, "FN": fn}
    }


if __name__ == "__main__":
    run_benchmark()

