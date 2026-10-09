import numpy as np

def ep(nn, ela, fft, b, r):
    sigs = [ela, b, fft, max(r, 0.10)]
    avg = float(np.mean(sigs))
    corr = sum(1 for s in sigs if s >= 0.60)
    if nn >= 0.55 and corr >= 2:
        boost = float(np.mean([s for s in sigs if s >= 0.60]))
        return 0.70*nn + 0.30*boost
    elif nn >= 0.45 and corr >= 1:
        return 0.80*nn + 0.20*avg
    else:
        return 0.90*nn + 0.10*avg

def cf(vit, foren):
    if vit >= 55:
        c = 0.75*vit + 0.25*foren
    elif vit >= 40:
        c = 0.75*vit + 0.25*foren
        if foren < 70:
            c = min(c, 49.9)
    elif vit >= 25:
        c = 0.90*vit + 0.10*foren
    else:
        c = min(0.95*vit + 0.05*foren, 40.0)
    return round(c, 2)

REAL = [
    ('Portrait natural',       0.15, 0.12, 0.08, 0.10, 0.10, 15),
    ('CLAHE ELA spike',        0.20, 0.55, 0.12, 0.15, 0.10, 22),
    ('Mobile FFT noise',       0.18, 0.20, 0.58, 0.12, 0.10, 18),
    ('Group multi-face',       0.22, 0.18, 0.15, 0.62, 0.10, 25),
    ('Landscape',              0.10, 0.10, 0.10, 0.10, 0.10, 10),
    ('Studio selfie',          0.30, 0.25, 0.18, 0.20, 0.15, 30),
    ('DSLR portrait',          0.12, 0.14, 0.10, 0.10, 0.10, 12),
    ('ELA+FFT both fire',      0.25, 0.65, 0.62, 0.20, 0.15, 28),
    ('Boundary+retouch spike', 0.20, 0.15, 0.15, 0.68, 0.70, 22),
    ('All moderate forensic',  0.35, 0.45, 0.42, 0.48, 0.38, 35),
]
FAKE = [
    ('FaceSwap deepfake',      0.85, 0.72, 0.65, 0.70, 0.60, 85),
    ('GAN face',               0.80, 0.35, 0.82, 0.40, 0.30, 80),
    ('NeuralTexture',          0.78, 0.68, 0.45, 0.72, 0.55, 78),
    ('Face2Face',              0.75, 0.60, 0.55, 0.68, 0.50, 75),
    ('Diffusion AI portrait',  0.90, 0.30, 0.88, 0.25, 0.20, 90),
    ('StyleGAN',               0.72, 0.40, 0.75, 0.35, 0.25, 72),
    ('Moderate fake',          0.60, 0.55, 0.52, 0.58, 0.45, 62),
    ('ViT>55 low forensic',    0.58, 0.30, 0.30, 0.30, 0.25, 58),
    ('High forensic FaceSwap', 0.82, 0.78, 0.75, 0.80, 0.70, 83),
    ('Compressed deepfake',    0.65, 0.62, 0.60, 0.65, 0.55, 66),
]

tp = tn = fp = fn = 0
print('=== REAL IMAGES (expected: REAL) ===')
for d,n,e,f,b,r,v in REAL:
    e2 = ep(n,e,f,b,r)
    c = cf(v, e2*100)
    pred = 'DEEPFAKE' if c >= 50 else 'REAL'
    ok = pred == 'REAL'
    if ok:
        tn += 1
    else:
        fp += 1
    status = 'OK' if ok else 'FP'
    print(f'  [{status}] {pred:8s} | {d:27s} vit={v}% forensic={e2*100:.1f}% combined={c}%')

print()
print('=== DEEPFAKE IMAGES (expected: DEEPFAKE) ===')
for d,n,e,f,b,r,v in FAKE:
    e2 = ep(n,e,f,b,r)
    c = cf(v, e2*100)
    pred = 'DEEPFAKE' if c >= 50 else 'REAL'
    ok = pred == 'DEEPFAKE'
    if ok:
        tp += 1
    else:
        fn += 1
    status = 'OK' if ok else 'FN'
    print(f'  [{status}] {pred:8s} | {d:27s} vit={v}% forensic={e2*100:.1f}% combined={c}%')

tot = tp + tn + fp + fn
acc = (tp + tn) / tot * 100
print()
print(f'Accuracy={acc:.1f}%  TP={tp}  TN={tn}  FP={fp}  FN={fn}')
