import { Navigate, useLocation } from "react-router-dom";
import Spinner from "../components/common/Spinner";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
	children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
	const { isAuthenticated, loading } = useAuth();
	const location = useLocation();

	if (loading) {
		return <Spinner />;
	}

	// If not authenticated, redirect to login while saving the attempted URL
	if (!isAuthenticated) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	// If authenticated, render the protected content
	return <>{children}</>;
};

export default ProtectedRoute;
