import asyncio, os, inspect
from dotenv import load_dotenv
from finlight_client import FinlightApi, ApiConfig
from finlight_client.models import GetArticlesWebSocketParams

def on_article(data):
    print("ARTICLE:", data)

load_dotenv(override=True)

async def main():
    api_key = os.getenv("FINLIGHT_KEY")
    client = FinlightApi(config=ApiConfig(api_key=api_key))

    # See what the SDK actually expects:
    print("connect signature:", inspect.signature(client.websocket.connect))

    # If the SDK has any cheap REST method, try it first to confirm auth.
    # (Common names: client.health(), client.me(), client.profile(), client.articles.search, etc.)
    # Uncomment one if it exists in your version:
    # print(await client.health())
    # print(await client.me())

    payload = GetArticlesWebSocketParams(query="nvidia", extended=False)

    # Only pass what the signature allows (usually these two):
    await client.websocket.connect(request_payload=payload, on_article=on_article)

if __name__ == "__main__":
    asyncio.run(main())
2