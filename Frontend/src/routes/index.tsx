import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/layout/Layout";
import ProtectedRoute from "./ProtectedRoute";
import Home from "../pages/Home";
import Login from "../pages/LogIn";
import Register from "../pages/Register";
import Profile from "../pages/Profile";
import ProfileEdit from "../pages/ProfileEdit";
import NotFound from "../pages/NotFound";
import Oauth from "../pages/Callbacks/Oauth";
import ConfirmEmail from "../pages/Callbacks/ConfirmEmail";
import Browse from "../pages/Browse";
import PublicProfile from "../pages/PublicProfile";
import ResetPassword from "../pages/Callbacks/ResetPassword";
import Video from "../pages/Video";

const protectedRoutes = {
	profileEdit: {
		path: "profile/edit",
		element: (
			<ProtectedRoute>
				<ProfileEdit />
			</ProtectedRoute>
		),
	},
	library: {
		path: "library",
		element: (
			<ProtectedRoute>
				<Browse />
			</ProtectedRoute>
		),
	},
	profile: {
		path: "profile",
		element: (
			<ProtectedRoute>
				<Profile />
			</ProtectedRoute>
		),
	},
	publicProfile: {
		path: "profile/view/:username",
		element: (
			<ProtectedRoute>
				<PublicProfile />
			</ProtectedRoute>
		),
	},
	video: {
		path: "watch",
		element: (
			<ProtectedRoute>
				<Video />
			</ProtectedRoute>
		),
	},
};

const publicRoutes = {
	home: {
		index: true,
		element: <Home />,
	},
	login: {
		path: "login",
		element: <Login />,
	},
	register: {
		path: "register",
		element: <Register />,
	},
};

const callbackRoutes = {
	oauth: {
		path: "auth/oauth/callback",
		element: <Oauth />,
	},
	confirmEmail: {
		path: "auth/email/callback",
		element: <ConfirmEmail />,
	},
	resetPassword: {
		path: "auth/password/reset",
		element: <ResetPassword />,
	},
};

// 404 default route if not found
const defaultRoute = {
	notFound: {
		path: "*",
		element: <NotFound />,
	},
};

export const router = createBrowserRouter(
	[
		{
			path: "/",
			element: <Layout />,
			children: [
				...Object.values(publicRoutes),
				...Object.values(protectedRoutes),
				...Object.values(callbackRoutes),
				...Object.values(defaultRoute),
			],
		},
	],
	{
		future: {
			v7_relativeSplatPath: true,
			v7_fetcherPersist: true,
			v7_normalizeFormMethod: true,
			v7_partialHydration: true,
			v7_skipActionErrorRevalidation: true,
		},
	}
);

export const routes = {
	...publicRoutes,
	...protectedRoutes,
	...callbackRoutes,
	...defaultRoute,
};
