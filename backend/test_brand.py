from app.ai.brand_verifier import verify_brand

text = """
Amazon Mega Sale
Scan QR to Win
"""

url = "https://freegift.xyz"

print(verify_brand(text, url))