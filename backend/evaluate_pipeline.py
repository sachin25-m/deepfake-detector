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
    If is_manipulated=True, introduces localized blend seams and ELA discrepancies.
    If is_ai_synth=True, introduces high-frequency Fourier grid artifacts.
    """
    np.random.seed(seed)
    w, h = size
    img = Image.new('RGB', (w, h), color=(220, 225, 230))
    draw = ImageDraw.Draw(img)
    
    # Natural background gradient
    for y in range(h):
        r = int(180 + 40 * (y / h))
        g = int(190 + 30 * (y / h))
        b = int(210 + 20 * (y / h))
        draw.line([(0, y), (w, y)], fill=(r, g, b))
        
    # Head & Face oval
    cx, cy = w // 2, h // 2
    face_w, face_h = int(w * 0.45), int(h * 0.55)
    
    # Skin base (natural smooth edge without sharp vector line stroke)
    skin_color = (235, 195, 170)
    draw.ellipse([cx - face_w, cy - face_h, cx + face_w, cy + face_h], fill=skin_color)

    
    # Eyes
    eye_y = cy - int(face_h * 0.2)
    eye_offset = int(face_w * 0.45)
    draw.ellipse([cx - eye_offset - 25, eye_y - 12, cx - eye_offset + 25, eye_y + 12], fill=(255, 255, 255), outline=(100, 70, 50))
    draw.ellipse([cx + eye_offset - 25, eye_y - 12, cx + eye_offset + 25, eye_y + 12], fill=(255, 255, 255), outline=(100, 70, 50))
    draw.ellipse([cx - eye_offset - 10, eye_y - 10, cx - eye_offset + 10, eye_y + 10], fill=(60, 40, 30))
    draw.ellipse([cx + eye_offset - 10, eye_y - 10, cx + eye_offset + 10, eye_y + 10], fill=(60, 40, 30))
    
    # Nose & Mouth
    draw.line([(cx, cy - 10), (cx - 8, cy + 25), (cx + 8, cy + 25)], fill=(180, 130, 100), width=3)
    mouth_y = cy + int(face_h * 0.45)
    draw.arc([cx - 40, mouth_y - 15, cx + 40, mouth_y + 15], start=0, end=180, fill=(190, 80, 80), width=4)
    
    # Hair & perimeter details
    draw.arc([cx - face_w - 10, cy - face_h - 20, cx + face_w + 10, cy], start=180, end=360, fill=(50, 35, 25), width=25)
    
    img_np = np.array(img, dtype=np.float32)
    # Add natural photographic texture noise across background and hair
    bg_noise = np.random.normal(0, 8, img_np.shape)
    img_np += bg_noise
    
    if is_manipulated:
        # 1. Deepfake Face Swap boundary artifact (seam blur & gradient discontinuity)
        zone_y1, zone_y2 = cy - int(face_h*0.5), cy + int(face_h*0.5)
        zone_x1, zone_x2 = cx - int(face_w*0.5), cx + int(face_w*0.5)
        face_crop = img_np[zone_y1:zone_y2, zone_x1:zone_x2].copy()
        
        # Localized lighting mismatch and texture perturbation
        face_crop = face_crop * 1.22 + np.random.normal(0, 22, face_crop.shape)
        face_crop = np.clip(face_crop, 0, 255)
        
        fh, fw, _ = face_crop.shape
        # Create circular alpha blending mask with feathering
        mask_img = Image.new('L', (fw, fh), 0)
        mask_draw = ImageDraw.Draw(mask_img)
        radius = min(fw, fh) // 2 - 8
        mask_draw.ellipse([(fw//2 - radius, fh//2 - radius), (fw//2 + radius, fh//2 + radius)], fill=255)
        mask_img = mask_img.filter(ImageFilter.GaussianBlur(radius=8))
        mask_arr = np.array(mask_img, dtype=np.float32)[:, :, None] / 255.0
        
        orig_zone = img_np[zone_y1:zone_y2, zone_x1:zone_x2]
        blended = orig_zone * (1.0 - mask_arr) + face_crop * mask_arr
        img_np[zone_y1:zone_y2, zone_x1:zone_x2] = blended
        
    if is_ai_synth:
        # 2. AI GAN/Diffusion spectral grid checkerboard artifact
        grid_pattern = np.sin(np.linspace(0, 32 * np.pi, w))[:, None] * np.cos(np.linspace(0, 32 * np.pi, h))[None, :]
        grid_3d = np.repeat(grid_pattern[:, :, None], 3, axis=2) * 25.0
        img_np = np.clip(img_np + grid_3d, 0, 255)
        
    final_img = Image.fromarray(np.uint8(np.clip(img_np, 0, 255)))
    return final_img



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
    print("Initializing Vision Transformer & Face Detector for evaluation...")
    if "model" not in main.ml_models:
        main.ml_models["processor"] = main.AutoImageProcessor.from_pretrained(main.MODEL_NAME)
        main.ml_models["model"] = main.AutoModelForImageClassification.from_pretrained(main.MODEL_NAME)
        main.ml_models["model"].eval()
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
        
        # 2. Vision Transformer Inference
        vit_fake_p = 0.0
        vit_real_p = 100.0
        face_count = 0
        is_cropped = False
        
        if "model" in main.ml_models:
            _, _, full_real_p, full_fake_p, _ = main.run_model_inference(pil_img)
            vit_fake_p = full_fake_p
            vit_real_p = full_real_p
            
            if "face_cascade" in main.ml_models:
                cropped_img, face_count, is_cropped = main.detect_and_crop_face(pil_img, main.ml_models["face_cascade"])
                if is_cropped:
                    _, _, crop_real_p, crop_fake_p, _ = main.run_model_inference(cropped_img)
                    if crop_fake_p > vit_fake_p:
                        vit_fake_p = crop_fake_p
                        vit_real_p = crop_real_p

        # 3. Combined Fusion Logic
        if vit_fake_p >= 50.0:
            combined_fake_p = max(vit_fake_p, 0.70 * vit_fake_p + 0.30 * forensic_p_fake)
        elif forensic_p_fake >= 50.0:
            combined_fake_p = max(forensic_p_fake, 0.60 * forensic_p_fake + 0.40 * vit_fake_p)
        else:
            combined_fake_p = 0.70 * vit_fake_p + 0.30 * forensic_p_fake

            
        combined_real_p = round(100.0 - combined_fake_p, 2)
        combined_fake_p = round(combined_fake_p, 2)
        
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

