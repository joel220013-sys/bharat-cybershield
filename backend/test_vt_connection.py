import requests

from app.core.config import VIRUSTOTAL_API_KEY

url = "https://www.virustotal.com/api/v3/users/current"

headers = {
    "x-apikey": VIRUSTOTAL_API_KEY
}

try:
    response = requests.get(url, headers=headers, timeout=20)

    print("Status Code:", response.status_code)
    print(response.text)

except Exception as e:
    print(e)
    