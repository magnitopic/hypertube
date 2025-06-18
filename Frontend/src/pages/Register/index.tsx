import React from "react";
import Form from "./Form";

const index: React.FC = () => {
	return (
		<main className="flex flex-1 justify-center items-center flex-col bg-gradient-to-b from-background-main from-60% to-white to-60%">
			<section className="container max-w-4xl text-center my-20 px-3 flex flex-col items-center gap-10">
				<h1 className="lg:text-5xl text-2xl text-gray-8 font-bold">
					Register
				</h1>
				<Form />
			</section>
		</main>
	);
};

export default index;
