import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../api/authApi";
import "../styles/login.css";

export default function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        full_name: "",
        email: "",
        password: "",
        role: "employee"
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

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
        setSuccess("");

        try {
            const response = await register(form);
            setSuccess("Registration successful! Redirecting to login...");
            
            setTimeout(() => {
                navigate("/");
            }, 1500);
        } catch (err) {
            let errMessage = "Registration Failed";
            if (err.response?.data?.message) {
                if (typeof err.response.data.message === "object") {
                    errMessage = Object.values(err.response.data.message).join(", ");
                } else {
                    errMessage = err.response.data.message;
                }
            }
            setError(errMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>CRM Register</h2>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="full_name"
                        placeholder="Full Name"
                        className="form-control mb-3"
                        value={form.full_name}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        className="form-control mb-3"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        className="form-control mb-3"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />

                    <select
                        name="role"
                        className="form-control mb-3"
                        value={form.role}
                        onChange={handleChange}
                    >
                        <option value="employee">Employee</option>
                        <option value="admin">Admin</option>
                    </select>

                    {error && (
                        <div className="alert alert-danger mb-3">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="alert alert-success mb-3">
                            {success}
                        </div>
                    )}

                    <button
                        className="btn btn-primary w-100 mb-3"
                        disabled={loading}
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>

                <div className="text-center">
                    <span className="text-muted">Already have an account? </span>
                    <Link to="/" className="text-decoration-none">
                        Login here
                    </Link>
                </div>
            </div>
        </div>
    );
}
