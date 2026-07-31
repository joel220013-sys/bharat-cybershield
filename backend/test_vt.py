from app.core.config import VIRUSTOTAL_API_KEY

print("=" * 50)
print("VirusTotal API Test")
print("=" * 50)

if VIRUSTOTAL_API_KEY:
    print("API Key Loaded Successfully!")
    print(VIRUSTOTAL_API_KEY[:10] + "...")
else:
    print("API Key Not Found")