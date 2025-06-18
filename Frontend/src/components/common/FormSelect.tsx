interface SelectOption {
	value: string;
	label: string;
}

interface SelectInputProps {
	name: string;
	value?: string;
	onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
	options: SelectOption[];
	defaultOption?: string;
	placeholder?: string;
	error?: string;
}

const SelectInput: React.FC<SelectInputProps> = ({
	name,
	value = "",
	onChange,
	options,
	defaultOption = "Select an option",
	error,
}) => {
	return (
		<div className="w-full">
			<select
				id={name}
				name={name}
				value={value}
				onChange={onChange}
				className={`bg-gray-50 border text-gray-900 text-sm rounded-lg block w-full p-2.5 transition-colors${
					error
						? "border-red-500 focus:ring-red-500 focus:border-red-500"
						: "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
				}`}
			>
				<option value="" disabled={true}>
					{defaultOption}
				</option>
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
			{error && <p className="mt-1 text-sm text-red-500">{error}</p>}
		</div>
	);
};

export default SelectInput;
