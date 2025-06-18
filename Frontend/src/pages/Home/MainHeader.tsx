import React from "react";
import { Link } from "react-router-dom";
import StyledButton from "../../components/common/StyledButton";

const MainHeader: React.FC = () => {
	return (
		<section className="container max-w-4xl text-center my-20 px-3">
			<div className="flex justify-center items-center flex-col gap-10">
				<img src="/logo.png" alt="" className="max-w-40" />
				<h1 className="lg:text-5xl text-2xl text-gray-8">
					Welcome to Hypertube!
				</h1>
				<p className="text-gray-5 text-lg">
					Video streaming webpage for torrents
				</p>
				<Link to="/profile">
					<StyledButton value="Start Here" />
				</Link>
			</div>
		</section>
	);
};

export default MainHeader;
