import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext";

function App() {
	return (
		<AuthProvider>
			<RouterProvider
				future={{ v7_startTransition: true }}
				router={router}
			/>
		</AuthProvider>
	);
}

export default App;
