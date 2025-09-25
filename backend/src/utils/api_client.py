# backend\src\utils\api_client.py

import json
from src import Config
from openai import OpenAI

BASE_URL = Config.MODEL_BASE_URL
API_KEY = Config.MODEL_API_KEY
MODEL = Config.MODEL


def query_model(prompt, agent_system_prompt):
    SYSTEM_PROMPT = """You must respond with ONLY valid JSON, no other text.

        CRITICAL RULES:
        1. Output ONLY the JSON object, no explanations, no thinking
        2. Use this exact ouput format:
        {
        "actions": [
            {"machine_id": number, "action": "action_type", "value": number}
        ],
        "impact": {
            "throughput_change_percent": number,
            "energy_change_percent": number,
            "notes": "Brief explanation"
        }
        }
        3. If no actions needed, use empty array: "actions": []
        4. Keep notes brief (1 sentence)
        5. Be straiforward and concise, no extra thinking steps

        IMPORTANT: Your response must start with { and end with } - no other text!"""
    
    SYSTEM_PROMPT = agent_system_prompt + "\n" + SYSTEM_PROMPT

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": prompt},
    ]

    client = OpenAI(api_key=API_KEY, base_url=BASE_URL)

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            # max_tokens=4096,
            temperature=0.1,  # Very low temperature for consistent formatting
            stream=False,
        )

        result = response.choices[0].message.content.strip() # Remoeve leading/trailing whitespace

        # JSON extraction
        cleaned_result = extract_json(response_text=result)

        if not cleaned_result:
            return {
                "actions": [],
                "impact": {
                    "throughput_change_percent": 0,
                    "energy_change_percent": 0,
                    "notes": "No valid JSON found in response",
                },
            }

        parsed_data = json.loads(cleaned_result)
        return parsed_data

    except Exception as e:
        print(f"API call error: {e}")
        return {
            "actions": [],
            "impact": {
                "throughput_change_percent": 0,
                "energy_change_percent": 0,
                "notes": f"API error: {str(e)}",
            },
        }


def extract_json(response_text):
    # Try to extract JSON from response
    try:
        # If the model wraps JSON in code blocks
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()

        return response_text

    except json.JSONDecodeError as e:
        print(f"JSON decoding error: {e}")
        return (f"JSON decoding error: {e}", None)
