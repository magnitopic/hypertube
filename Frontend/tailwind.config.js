/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	// colors
	theme: {
		extend: {
			colors: {
				primary: "#3AB5C5", // Salmon
				"primary-monochromatic": "#61C4D1",
				secondary: "#3A70C5",
				"secondary-light": "#759bd6",
				tertiary: "#3AC58F",
				"font-main": "#414B61",
				"font-secondary": "#A5A5A5",
				"background-main": "#F5F5F5",
				"background-secondary": "#E5E5E5",
				"hover-header": "#f2f4ff",
			},
		},
	},
};
