import easyocr

# Load the OCR model once when the application starts
reader = easyocr.Reader(['en'], gpu=False)


def extract_text(image_path: str):
    """
    Extract text from an image using EasyOCR.

    Args:
        image_path (str): Path to the image.

    Returns:
        dict: {
            "text": "<combined text>",
            "lines": [list of detected text lines]
        }
    """
    results = reader.readtext(image_path)

    lines = []

    for result in results:
        _, text, _ = result
        lines.append(text)

    combined_text = " ".join(lines)

    return {
        "text": combined_text,
        "lines": lines
    }
