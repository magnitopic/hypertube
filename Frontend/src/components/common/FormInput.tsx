import React from "react";

interface FormInputProps {
	type?: string;
	placeholder?: string;
	name: string;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	error?: string;
}

const FormInput: React.FC<FormInputProps> = ({
	type = "text",
	placeholder,
	name,
	value,
	onChange,
	error,
}) => {
	return (
		<div className="w-full">
			<input
				id={name}
				type={type}
				name={name}
				value={value}
				onChange={onChange}
				className={`border ${
					error ? "border-red-500" : "border-gray-300"
				} rounded-md w-full p-3 my-1`}
				placeholder={placeholder}
			/>
			{error && <p className="text-red-500 text-sm mt-1">{error}</p>}
		</div>
	);
};

export default FormInput;
