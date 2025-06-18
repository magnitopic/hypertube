import React, { useState } from "react";
import RegularButton from "../../components/common/RegularButton";
import Modal from "../../components/common/Modal";
import MsgCard from "../../components/common/MsgCard";
import FormInput from "../../components/common/FormInput";
import { useEditProfile } from "../../hooks/PageData/useEditProfile";

const PasswordChange: React.FC = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const { resetPassword, loading } = useEditProfile();

	const [email, setEmail] = useState("");

	const [msg, setMsg] = useState<{
		type: "error" | "success";
		message: string;
		key: number; // Add a key to force re-render
	} | null>(null);

	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setEmail(e.target.value);
	};

	const handleSubmit = () => async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			const response = await resetPassword(email);
			if (response && response.msg) {
				setMsg({
					type: "success",
					message: response.msg || "Email sent successfully",
					key: Date.now(),
				});
				setEmail("");
			}
		} catch (error) {
			setMsg({
				type: "error",
				message:
					error.message ||
					"Failed to send email. Please try again later",
				key: Date.now(),
			});
		}
	};

	return (
		<>
			{/* Modal */}
			{isModalOpen && (
				<Modal
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
				>
					{msg && (
						<MsgCard
							key={msg.key}
							type={msg.type}
							message={msg.message}
							onClose={() => setMsg(null)}
						/>
					)}
					{/* Header */}
					<div className="flex items-center justify-between p-4 border-b">
						<h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
							<span className="fa fa-key" />
							Reset password
						</h3>
						<button
							onClick={() => setIsModalOpen(false)}
							className="p-2 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
						>
							<span className="fa fa-close" />
						</button>
					</div>
					{/* Content */}
					<div className="p-4 md:p-6">
						<form
							className="flex flex-col gap-4 md:gap-6 md:mx-5"
							onSubmit={handleSubmit()}
						>
							{/* OldPassword */}
							<FormInput
								name="email"
								value={email}
								onChange={onChange}
								placeholder="Email"
								type="email"
							/>
							{/* Submit Button */}
							<RegularButton value="Send Reset Link" />
						</form>
					</div>
				</Modal>
			)}
			<div className="w-full text-start p-0 mt-4">
				<p>
					Forgot your password?{" "}
					<button
						onClick={() => setIsModalOpen(true)}
						className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
						disabled={loading}
					>
						Reset password
					</button>
				</p>
			</div>
		</>
	);
};

export default PasswordChange;
