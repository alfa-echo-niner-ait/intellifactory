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

1. **Initialize & migrate**

   ```bash
   export FLASK_APP=app.py
   flask db init         # only once
   flask db migrate -m "Initial tables"
   flask db upgrade
   ```

2. **Seed dummy data (only when needed)**

   ```bash
   python seed_db.py
   ```

### Routes check

`http://localhost:5000/api/machines`

`http://localhost:5000/api/orders`

`http://localhost:5000/api/agents/run`