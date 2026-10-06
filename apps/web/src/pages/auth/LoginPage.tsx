import { Navigate } from "react-router-dom";

import { useAppSelector } from "../../hooks/redux";
import LoginForm from "../../features/auth/components/LoginForm";
import { isEmployeeUser } from "../../utils/roles";

const LoginPage = () => {
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);

    if (isAuthenticated) {
        if (isEmployeeUser(user)) {
            return <Navigate to="/portal" replace />;
        }
        return <Navigate to="/" replace />;
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #0b1329 0%, #1e293b 100%)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "24px 16px",
            }}
        >
            <LoginForm />
        </div>
    );
};

export default LoginPage;
