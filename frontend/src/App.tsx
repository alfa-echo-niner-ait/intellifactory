import "./App.css";
import { Button } from "@/components/ui/button";

function App() {
	return (
		<>
			<div className="min-h-dvh flex justify-center items-center">
				<div className="bg-gray-50 p-10">
					<h1 className="text-3xl text-center my-20 font-bold text-blue-700 py-15">
						IntelliFacory!
					</h1>
					<div className="flex flex-wrap items-center gap-2 md:flex-row">
						<Button>Button</Button>
					</div>
				</div>
			</div>
		</>
	);
}

export default App;
