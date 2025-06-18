import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useBreakpoints } from "../../../hooks/useBreakpoints";
import { useAuth } from "../../../context/AuthContext";

const Header: React.FC = () => {
	const { isAuthenticated, user, logout } = useAuth();
	const navigate = useNavigate();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const { isMobile, isTablet, isDesktop } = useBreakpoints();

	// Reset menu state when screen size changes
	useEffect(() => {
		if (!isMobile && !isTablet) setIsMenuOpen(false);
	}, [isTablet, isDesktop]);

	useEffect(() => {
		if (isMenuOpen) {
			document.body.style.overflow = "hidden";
			document.body.style.position = "fixed";
			document.body.style.width = "100%";
		} else {
			document.body.style.overflow = "";
			document.body.style.position = "";
			document.body.style.width = "";
		}

		return () => {
			document.body.style.overflow = "";
			document.body.style.position = "";
			document.body.style.width = "";
		};
	}, [isMenuOpen]);

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	const handleLinkClick = () => {
		setIsMenuOpen(false);
	};

	const handleLogout = async () => {
		const response = await logout();
		if (response.success) {
			setIsMenuOpen(false);
			navigate("/");
		}
	};

	// User menu component for desktop
	const UserMenu = () => (
		<div className="flex items-center gap-4">
			<div className="flex items-center gap-2">
				<span className="text-primary font-medium">
					{user?.username}
				</span>
			</div>
			<button
				onClick={handleLogout}
				className="bg-primary text-white btn whitespace-nowrap text-sm px-6 py-2 rounded-full hover:bg-primary-monochromatic transition-colors duration-300"
			>
				Logout
			</button>
		</div>
	);

	// Auth buttons component for desktop
	const AuthButtons = () => (
		<div className="flex items-center gap-3">
			<Link to="/login">
				<button className="text-primary border border-primary btn whitespace-nowrap text-sm px-6 py-2 rounded-full hover:bg-primary hover:text-white transition-colors duration-300">
					Login
				</button>
			</Link>
			<Link to="/register">
				<button className="bg-primary text-white btn whitespace-nowrap text-sm px-6 py-2 rounded-full hover:bg-primary-monochromatic transition-colors duration-300">
					Register
				</button>
			</Link>
		</div>
	);

	return (
		<header
			className={`transition-all duration-300 z-30 ${
				isMenuOpen ? "bg-primary" : "bg-white"
			}`}
		>
			<div className="container mx-auto lx:p-7 py-5 px-4">
				<div className="flex justify-between items-center">
					<h1
						className={`text-3xl font-bold ${
							isMenuOpen ? "text-white" : "text-primary"
						}`}
					>
						<Link to="/" onClick={handleLinkClick}>
							Hypertube
						</Link>
					</h1>

					{isDesktop && (
						<>
							<nav className="flex justify-center flex-1">
								<div className="flex gap-4 flex-wrap items-center justify-center">
									<Link to="/">
										<button className="text-font-main font-medium btn whitespace-nowrap text-base px-6 py-2 rounded-full hover:bg-secondary-light transition-colors duration-300">
											Home
										</button>
									</Link>
									<Link to="/library">
										<button className="text-font-main font-medium btn whitespace-nowrap text-base px-6 py-2 rounded-full hover:bg-secondary-light transition-colors duration-300">
											Library
										</button>
									</Link>
									<Link to="/watch">
										<button className="text-font-main font-medium btn whitespace-nowrap text-base px-6 py-2 rounded-full hover:bg-secondary-light transition-colors duration-300">
											Video
										</button>
									</Link>
									<Link to="/profile">
										<button className="text-font-main font-medium btn whitespace-nowrap text-base px-6 py-2 rounded-full hover:bg-secondary-light transition-colors duration-300">
											Profile
										</button>
									</Link>
								</div>
							</nav>
							{isAuthenticated && user ? (
								<UserMenu />
							) : (
								<AuthButtons />
							)}
						</>
					)}

					{/* Mobile menu button */}
					{(isMobile || isTablet) && (
						<div className="flex items-center gap-4">
							<button
								onClick={toggleMenu}
								className="flex rounded-full p-2 bg-white w-10 h-10 justify-center items-center"
								aria-label={
									isMenuOpen ? "Close menu" : "Open menu"
								}
							>
								<div className="flex flex-col items-center justify-center w-5 h-5">
									<span
										className={`h-[2px] w-5 bg-black transition-all duration-300 absolute ${
											isMenuOpen
												? "rotate-45"
												: "-translate-y-2"
										}`}
									></span>
									<span
										className={`h-[2px] w-5 bg-black transition-all duration-300 ${
											isMenuOpen
												? "opacity-0"
												: "opacity-100"
										}`}
									></span>
									<span
										className={`h-[2px] w-5 bg-black transition-all duration-300 absolute ${
											isMenuOpen
												? "-rotate-45"
												: "translate-y-2"
										}`}
									></span>
								</div>
							</button>
						</div>
					)}

					{/* Mobile menu */}
					{(isMobile || isTablet) && (
						<div
							className={`fixed inset-0 bg-primary transform transition-transform duration-300 ease-in-out ${
								isMenuOpen
									? "translate-x-0"
									: "translate-x-full"
							} z-40 mt-20 overflow-y-auto`}
						>
							<nav className="container flex flex-col text-white p-6">
								<div className="flex flex-col gap-4 mb-8">
									{isAuthenticated && user && (
										<div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/20">
											<span className="text-white font-medium">
												{"Hello "}
												<Link
													to="/profile"
													onClick={handleLinkClick}
													className="font-bold underline"
												>
													{user.username}
												</Link>
											</span>
										</div>
									)}
									<Link to="/" onClick={handleLinkClick}>
										<button className="w-full text-left px-4 py-3 rounded-lg hover:bg-primary-monochromatic transition-colors duration-300">
											Home
										</button>
									</Link>
									<Link
										to="/library"
										onClick={handleLinkClick}
									>
										<button className="w-full text-left px-4 py-3 rounded-lg hover:bg-primary-monochromatic transition-colors duration-300">
											Library
										</button>
									</Link>
									<Link to="/watch" onClick={handleLinkClick}>
										<button className="w-full text-left px-4 py-3 rounded-lg hover:bg-primary-monochromatic transition-colors duration-300">
											Video
										</button>
									</Link>
									<Link
										to="/profile"
										onClick={handleLinkClick}
									>
										<button className="w-full text-left px-4 py-3 rounded-lg hover:bg-primary-monochromatic transition-colors duration-300">
											Profile
										</button>
									</Link>
								</div>

								<div className="mt-auto border-t border-white/20 pt-4">
									{isAuthenticated ? (
										<button
											onClick={handleLogout}
											className="w-full text-left px-4 py-3 rounded-lg hover:bg-primary-monochromatic transition-colors duration-300"
										>
											Logout
										</button>
									) : (
										<div className="flex flex-col gap-2">
											<Link
												to="/login"
												onClick={handleLinkClick}
											>
												<button className="w-full text-left px-4 py-3 rounded-lg hover:bg-primary-monochromatic transition-colors duration-300">
													Login
												</button>
											</Link>
											<Link
												to="/register"
												onClick={handleLinkClick}
											>
												<button className="w-full text-left px-4 py-3 rounded-lg hover:bg-primary-monochromatic transition-colors duration-300">
													Register
												</button>
											</Link>
										</div>
									)}
								</div>
							</nav>
						</div>
					)}
				</div>
			</div>
		</header>
	);
};

export default Header;
