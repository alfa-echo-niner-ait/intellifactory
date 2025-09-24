import os, requests, json
from src import Config

BASE_URL = Config.MODEL_BASE_URL
API_KEY = Config.MODEL_API_KEY
MODEL = Config.MODEL


def query_model(prompt: str):
    url = f"{BASE_URL}/chat/completions"
    headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
    payload = {
        "model": MODEL,
        "messages": [
            {
                "role": "system",
                "content": "You are an expert factory optimization agent. Reply ONLY with JSON.",
            },
            {"role": "user", "content": prompt},
        ],
        "max_tokens": 1024,
        "temperature": 0.3,
        "response_format": {"type": "json_object"},
        "stream": False,
    }

    try:
        resp = requests.post(url, headers=headers, data=json.dumps(payload), timeout=30)
        resp.raise_for_status()
        data = resp.json()
        # Parse content safely
        return data.get("choices", [{}])[0].get("message", {}).get("content", "")
    except requests.exceptions.ReadTimeout:
        return "Error querying model: Request timed out"
    except Exception as e:
        return f"Error querying model: {e}"
