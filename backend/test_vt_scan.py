from app.ai.virustotal import check_url_virustotal

url = "https://google.com"

result = check_url_virustotal(url)

print(result)