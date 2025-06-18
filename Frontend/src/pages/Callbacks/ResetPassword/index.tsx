import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import RegularButton from "../../../components/common/RegularButton";
import FormInput from "../../../components/common/FormInput";
import MsgCard from "../../../components/common/MsgCard";

const index: React.FC = () => {
	const { resetPassword } = useAuth();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [pageMsg, setPageMsg] = useState<string>("Reset your password");
	const [error, setError] = useState<string>("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const [msg, setMsg] = useState<{
		type: "error" | "success";
		message: string;
		key: number; // Add a key to force re-render
	} | null>(null);

	useEffect(() => {
		const token = searchParams.get("token");

		if (!token) {
			setPageMsg(
				"Invalid reset link. Please request a new password reset."
			);
			setError("text-red-400");
		}
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const token = searchParams.get("token");

		if (!token) {
			setPageMsg(
				"Invalid reset link. Please request a new password reset."
			);
			setError("text-red-400");
			return;
		}

		if (password !== confirmPassword) {
			setMsg({
				type: "error",
				message: "Passwords do not match",
				key: Date.now(),
			});
			return;
		}

		try {
			const response = await resetPassword(token, password);

			if (response.success) {
				setMsg({
					type: "success",
					message:
						response.message + ". Redirecting..." ||
						"Password reset successful. Redirecting...",
					key: Date.now(),
				});
				setTimeout(() => navigate("/login"), 2000);
			} else {
				setMsg({
					type: "error",
					message:
						response.message ||
						"An error occurred during password reset. Please try again.",
					key: Date.now(),
				});
			}
		} catch (err) {
			setMsg({
				type: "error",
				message:
					err.message ||
					"An error occurred during password reset. Please try again.",
				key: Date.now(),
			});
		}
	};

	return (
		<main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background-main from-60% to-white to-60%">
			{msg && (
				<MsgCard
					key={msg.key}
					type={msg.type}
					message={msg.message}
					onClose={() => setMsg(null)}
				/>
			)}
			<section className="container max-w-4xl text-center my-20 px-3 flex flex-col items-center gap-10">
				<h1 className="lg:text-5xl text-2xl text-gray-8 font-bold">
					Reset your password
				</h1>

				{!error && (
					<div className="bg-white shadow-md p-10 rounded max-w-md w-full">
						<form onSubmit={handleSubmit} className="space-y-6">
							<p>Enter a new value for your account password</p>
							<FormInput
								type="password"
								name="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="New Password"
							/>
							<FormInput
								type="password"
								name="confirmPassword"
								value={confirmPassword}
								onChange={(e) =>
									setConfirmPassword(e.target.value)
								}
								placeholder="Confirm New Password"
							/>
							<RegularButton
								type="submit"
								value="Reset Password"
							/>
						</form>
					</div>
				)}

				{error && (
					<>
						<h1 className={`text-xl font-bold max-w-xl ${error}`}>
							{pageMsg}
						</h1>

						<div className="mx-auto mt-7">
							<RegularButton
								type="button"
								callback={() => navigate("/login")}
								value="Back to login form"
							/>
						</div>
					</>
				)}
			</section>
		</main>
	);
};

export default index;
