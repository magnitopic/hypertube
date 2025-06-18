import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import RegularButton from "../../../components/common/RegularButton";

const index: React.FC = () => {
	const { confirmEmail } = useAuth();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [pageMsg, setPageMsg] = useState<string>(
		"Confirming your email... hold on..."
	);
	const [error, setError] = useState<string>("");

	useEffect(() => {
		const confirmEmailAddress = async () => {
			const token = searchParams.get("token");

			if (!token) {
				setPageMsg(
					"No confirmation code found. Please check your email link."
				);
				setError("text-red-400");
				return;
			}

			try {
				const response = await confirmEmail(token);

				if (response.success) {
					setPageMsg("Email confirmed successfully! Redirecting...");
					setTimeout(() => navigate("/profile"), 1000);
					setError("text-green-600");
				} else {
					setPageMsg(
						response.message ||
							"Email confirmation failed. Please try again."
					);
					setError("text-red-400");
				}
			} catch (err) {
				setPageMsg(
					"An error occurred during email confirmation. Please try again."
				);
				setError("text-red-400");
			}
		};

		confirmEmailAddress();
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
