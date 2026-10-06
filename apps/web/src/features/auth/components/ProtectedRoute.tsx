import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAppSelector } from "../../../hooks/redux";

const ProtectedRoute = () => {
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
