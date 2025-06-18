import React, { useState } from "react";
import RegularButton from "../../components/common/RegularButton";
import Modal from "../../components/common/Modal";
import MsgCard from "../../components/common/MsgCard";
import FormInput from "../../components/common/FormInput";
import { useEditProfile } from "../../hooks/PageData/useEditProfile";

const PasswordChange: React.FC = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [viewPassword, setViewPassword] = useState(false);
	const { changePassword, loading } = useEditProfile();

	const [passwords, setPasswords] = useState({
		old_password: "",
		new_password: "",
	});

	const [confirmPassword, setConfirmPassword] = useState("");

	const [msg, setMsg] = useState<{
		type: "error" | "success";
		message: string;
		key: number; // Add a key to force re-render
	} | null>(null);

	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		if (name === "old_password")
			setPasswords({ ...passwords, old_password: value });
		if (name === "new_password")
			setPasswords({ ...passwords, new_password: value });
		if (name === "confirm-password") setConfirmPassword(value);
	};

	const handleSubmit = () => async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		/* checks */
		if (
			passwords.new_password.length < 1 ||
			passwords.old_password.length < 1 ||
			confirmPassword.length < 1
		) {
			setMsg({
				type: "error",
				message: "You have empty fields",
				key: Date.now(),
			});
			return;
		}
		if (passwords.new_password !== confirmPassword) {
			setMsg({
				type: "error",
				message: "Passwords do not match",
				key: Date.now(),
			});
			return;
		}
		/* request */
		try {
			const response = await changePassword(passwords);
			if (response && response.msg) {
				setMsg({
					type: "success",
					message: response.msg || "Password updated successfully",
					key: Date.now(),
				});
				setPasswords({
					old_password: "",
					new_password: "",
				});
				setConfirmPassword("");
			}
		} catch (error) {
			setMsg({
				type: "error",
				message:
					error.message ||
					"Failed to update password, please try again",
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
							Change password
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
							<div className="w-full ">
								<button
									className="flex flex-row gap-1 items-center shadow-md p-2"
									type="button"
									onClick={(e) =>
										setViewPassword(!viewPassword)
									}
								>
									<i
										className={`fa ${
											viewPassword
												? "fa-eye"
												: "fa-eye-slash"
										} cursor-pointer`}
									/>
									View Passwords
								</button>
							</div>

							{/* OldPassword */}
							<FormInput
								name="old_password"
								value={passwords.old_password}
								onChange={onChange}
								placeholder="Old Password"
								type={viewPassword ? "text" : "password"}
							/>
							{/* NewPassword */}
							<FormInput
								name="new_password"
								value={passwords.new_password}
								onChange={onChange}
								placeholder="New Password"
								type={viewPassword ? "text" : "password"}
							/>
							{/* Confirm Password */}
							<FormInput
								name="confirm-password"
								value={confirmPassword}
								onChange={onChange}
								placeholder="Confirm Password"
								type={viewPassword ? "text" : "password"}
							/>
							{/* Submit Button */}
							<RegularButton value="Change password" />
						</form>
					</div>
				</Modal>
			)}
			<div className="w-full flex justify-start">
				{/* Trigger Button */}
				<button
					type="button"
					onClick={() => setIsModalOpen(true)}
					className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary to-tertiary p-0.5 font-medium text-gray-900 hover:text-white focus:outline-none focus:ring-4 focus:ring-cyan-200"
				>
					<span className="flex items-center gap-2 rounded-md bg-white px-5 py-2.5 transition-all duration-75 ease-in group-hover:bg-opacity-0">
						<span className="fa fa-key" />
						Change Password
					</span>
				</button>
			</div>
		</>
	);
};

export default PasswordChange;
