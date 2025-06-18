import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import RegularButton from "../../../components/common/RegularButton";

const index: React.FC = () => {
	const { oauth } = useAuth();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [pageMsg, setPageMsg] = useState<string>(
		"Authenticating you... hold on..."
	);
	const [error, setError] = useState<string>("");

	useEffect(() => {
		const authenticate = async () => {
			const token = searchParams.get("code");
			let provider = searchParams.get("provider");

			if (!token) {
				setPageMsg(
					"No authorization code found. Please try to login again."
				);
				setError("text-red-400");
				return;
			}

			if (!provider) {
				provider = "42"; // Default to 42 if no provider is specified
			}

			if (!["github", "google", "twitch", "42"].includes(provider)) {
				setPageMsg("Invalid provider. Please try to login again.");
				setError("text-red-400");
				return;
			}

			try {
				const response = await oauth(token, provider);

				if (response.success) {
					setPageMsg("Authentication successful! Redirecting...");
					setTimeout(() => navigate("/profile"), 1000);
					setError("text-green-600");
				} else {
					setPageMsg(
						response.message ||
							"Authentication failed. Please try again."
					);
					setError("text-red-400");
				}
			} catch (err) {
				setPageMsg(
					"An error occurred during authentication. Please try again."
				);
				setError("text-red-400");
			}
		};

		authenticate();
	}, []);

	return (
		<main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background-main from-60% to-white to-60%">
			<div className="text-center">
				<h1 className={`text-xl font-bold max-w-xl ${error}`}>
					{pageMsg}
				</h1>
				{error && (
					<div className="mx-auto mt-7">
						<RegularButton
							type="button"
							callback={() => navigate("/login")}
							value="Back to login form"
						/>
					</div>
				)}
			</div>
		</main>
	);
};

export default index;
