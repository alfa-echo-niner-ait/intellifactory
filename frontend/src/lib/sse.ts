export function subscribeToEvents(onEvent: (event: MessageEvent) => void) {
	const evtSource = new EventSource("http://localhost:5000/api/events/stream");

	evtSource.onmessage = (e) => {
		console.log("Generic event:", e.data);
		onEvent(e);
	};

	evtSource.addEventListener("decision", (e) => {
		console.log("Decision event:", JSON.parse(e.data));
		onEvent(e);
	});

	evtSource.addEventListener("state_update", (e) => {
		console.log("State update:", JSON.parse(e.data));
		onEvent(e);
	});

	return evtSource;
}
