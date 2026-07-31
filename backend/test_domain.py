from app.ai.domain_reputation import check_domain_reputation

url = "https://google.com"

result = check_domain_reputation(url)

print(result)