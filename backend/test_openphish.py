from app.ai.openphish import check_openphish

url = "https://www.google.com"

result = check_openphish(url)

print(result)