import os
import torch
import cv2
from PIL import Image
from transformers import AutoImageProcessor, AutoModelForImageClassification
import torch.nn.functional as F

MODEL_NAME = "dima806/deepfake_vs_real_image_detection"

print("=" * 60)
print("REALNETRA DEEPFAKE DETECTION ACCURACY TEST")
print("=" * 60)

print(f"Loading HuggingFace Vision Transformer ({MODEL_NAME})...")
processor = AutoImageProcessor.from_pretrained(MODEL_NAME)
model = AutoModelForImageClassification.from_pretrained(MODEL_NAME)
model.eval()

# Check label mapping
print(f"Model Labels: {model.config.id2label}")

test_images = [
    ("test_real.jpg", "REAL (Authentic Portrait)"),
    ("test_fake.jpg", "DEEPFAKE (AI Manipulated Face)"),
    ("test_multiface.jpg", "REAL (Multiple Authentic Faces)"),
    ("test_mobile_large.jpg", "REAL (High-Res Mobile Photo)")
]

for filename, label in test_images:
    file_path = os.path.join(os.path.dirname(__file__), filename)
    if not os.path.exists(file_path):
        print(f"\n[SKIP] File missing: {filename}")
        continue
    
    img = Image.open(file_path).convert("RGB")
    inputs = processor(images=img, return_tensors="pt")
    
    with torch.no_grad():
        outputs = model(**inputs)
        probs = F.softmax(outputs.logits, dim=-1)[0]
    
    # Class 0: REAL / Class 1: FAKE (or according to id2label)
    label_0 = model.config.id2label.get(0, "REAL")
    label_1 = model.config.id2label.get(1, "FAKE")
    
    p0 = probs[0].item() * 100
    p1 = probs[1].item() * 100
    
    predicted_idx = torch.argmax(probs).item()
    predicted_label = model.config.id2label[predicted_idx].upper()
    
    print(f"\nImage: {filename} [{label}]")
    print(f"  Probability {label_0}: {p0:.2f}% | Probability {label_1}: {p1:.2f}%")
    print(f"  Predicted Verdict : {predicted_label}")
    print(f"  Status            : {'PASS [CORRECT]' if predicted_label in label or label.startswith(predicted_label) else 'FAIL'}")

print("\n" + "=" * 60)
