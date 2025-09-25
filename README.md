### Install Redis

```
https://github.com/MicrosoftArchive/redis/releases
```

### Install packages from `requirements.txt:`

```
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```
Absolutely—that’s the best approach. Let’s **separate migrations and seeding** so your app runs cleanly and you can reseed anytime without touching production or rerunning on every startup.

### Steps to run migrations and seed**

**Seed dummy data (only first time):**

```bash
python seed_db.py
```

### Routes check

`http://localhost:5000/api/machines`

`http://localhost:5000/api/orders`

### API check

```bash
curl --proxy "" -X POST http://127.0.0.1:5000/api/agents/quality
```

**Result example:**

```json
{
  "actions": [
    {
      "action": "schedule_maintenance",
      "machine_id": 1,
      "value": " preventive maintenance"
    },
    {
      "action": "schedule_maintenance",
      "machine_id": 3,
      "value": " preventive maintenance"
    },
    {
      "action": "reduce_speed",
      "machine_id": 2,
      "value": " to reduce idle time"
    }
  ],
  "impact": {
    "energy_change_percent": "Possible increase in energy usage due to high utilization",
    "notes": "Preventive maintenance on high utilization machines and reducing idle time on the milling machine to optimize energy usage and throughput.",
    "throughput_change_percent": "Potential decrease in throughput due to idle time"
  }
}
```