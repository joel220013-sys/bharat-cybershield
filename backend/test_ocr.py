from app.ai.ocr import extract_text

image_path = "test.jpg"

result = extract_text(image_path)

print(result)