from flask import Blueprint, Response
import json
import time
import queue
import threading

events_bp = Blueprint("events", __name__, url_prefix="/api/events")

# Shared queue for broadcasts
event_queue = queue.Queue()


def push_event(event_type, data):
    """Broadcast event to SSE clients"""
    event_queue.put({"event": event_type, "data": data, "time": time.time()})


@events_bp.route("/stream")
def stream():
    def event_stream():
        while True:
            event = event_queue.get()  # blocking wait
            yield f"event: {event['event']}\n"
            yield f"data: {json.dumps(event['data'])}\n\n"

    return Response(event_stream(), mimetype="text/event-stream")
