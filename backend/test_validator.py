from app.ai.url_validator import validate_url

test_urls = [
    "https://example.com",
    "http://example.com",
    "https://bit.ly/test",
    "http://192.168.1.1/login",
    "https://secure.example.com/account/login"
]

for url in test_urls:
    print("=" * 50)
    print("URL:", url)
    print(validate_url(url))