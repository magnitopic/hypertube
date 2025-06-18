import { Outlet } from "react-router-dom";
import Header from "./Header/Header";
import Footer from "./Footer/Footer";

const Layout = () => {

	return (
		<div className="min-h-screen flex flex-col">
			<Header />
			<Outlet />
			<Footer />
		</div>
	);
};

export default Layout;
