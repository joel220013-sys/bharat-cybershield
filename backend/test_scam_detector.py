from app.ai.ocr import extract_text
from app.ai.scam_detector import analyze_text

result = extract_text("test.jpg")

print("OCR TEXT:")
print(result["text"])

print("\nSCAM ANALYSIS:")
analysis = analyze_text(result["text"])

print(analysis)