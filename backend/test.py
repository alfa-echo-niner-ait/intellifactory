import json

text = """
```json\n{\n    "actions": [\n        {"machine_id": 2, "action": "increase_speed", "value": 1.0},\n        {"machine_id": 1, "action": "schedule_maintenance", "value": "high"},\n        {"machine_id": 4, "action": "reassign_job", "value": "pending_job_2"},\n        {"machine_id": 3, "action": "increase_speed", "value": 0.8}\n    ],\n    "impact": {\n        "throughput_change_percent": 15.0,\n        "energy_change_percent": -5.0,\n        "notes": "Increased Milling Machine speed to utilize idle time, scheduled CNC Lathe maintenance to prevent downtime, reassigned pending job to Milling Machine, and increased 3D Printer speed to reduce energy usage."\n    }\n}\n```
"""

text.strip()
print(type(text))

if "```json" in text:
    text = text.split("```json")[1].split("```")[0].strip()
    text = json.loads(text)
    print(type(text))
    print(f"Json: {text}")
elif "```" in text:
    text = text.split("```")[1].split("```")[0].strip()
    text = json.loads(text)
    print(type(text))
    print(f"Code: {text}")
else:
    print(type(text))
    print(f"Raw: {text}")
    
print("\nParsed content:")
print("----------------")
for key, value in text.items():
    print(f"{key}: {value}")
    print("----------------")
