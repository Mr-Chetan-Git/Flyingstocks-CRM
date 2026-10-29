import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/authApi";
import "../styles/login.css";

export default function Login() {

    const navigate = useNavigate();

    // If already authenticated, redirect directly to /dashboard
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token && token !== "undefined" && token !== "null" && token.trim() !== "") {
            navigate("/dashboard", { replace: true });
        }
    }, [navigate]);

    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setLoading(true);
        setError("");

        try {

            const response = await login(form);

            localStorage.setItem(
                "token",
                response.data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            navigate("/dashboard");

        } catch (err) {

            setError(
                err.response?.data?.message || err.response?.data?.msg || "Login Failed"
            );

        } finally {
            setLoading(false);
        }
    };

    return (

        <div className="login-container">

            <div className="login-card">

                <h2>CRM Login</h2>

                <form onSubmit={handleSubmit}>

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        className="form-control mb-3"
                        value={form.email}
                        onChange={handleChange}
                        autoComplete="username"
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        className="form-control mb-3"
                        value={form.password}
                        onChange={handleChange}
                        autoComplete="current-password"
                    />

                    {
                        error &&
                        <div className="alert alert-danger">
                            {error}
                        </div>
                    }

                    <button
                        className="btn btn-primary w-100 mb-3"
                        disabled={loading}
                    >
                        {
                            loading
                                ? "Logging in..."
                                : "Login"
                        }
                    </button>

                </form>

                <div className="text-center">
                    <span className="text-muted">Don't have an account? </span>
                    <Link to="/register" className="text-decoration-none">
                        Register here
                    </Link>
                </div>

            </div>

        </div>

    );

}