import { Link } from "react-router-dom";

const NotFound = () => {
	return (
		<main className="flex flex-col items-center justify-center flex-grow px-2">
			<h1 className="text-4xl font-bold">404 - Page Not Found :(</h1>
			<p className="mt-4">
				Sorry, the page you are looking for could not be found.
			</p>
			<Link to="/" className="mt-6 text-primary underline">
				Go back to Home
			</Link>
		</main>
	);
};

export default NotFound;
