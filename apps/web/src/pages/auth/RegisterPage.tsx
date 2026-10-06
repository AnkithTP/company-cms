import RegisterForm from "../../features/auth/components/RegisterForm";

const RegisterPage = () => {
    return (
        <div
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #0b1329 0%, #1e293b 100%)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "40px 16px",
            }}
        >
            <RegisterForm />
        </div>
    );
};

export default RegisterPage;
