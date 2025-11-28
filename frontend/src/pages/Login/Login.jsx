import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    const result = await login(formData.email, formData.password);
    if (result.success) {
      if (result.user.role === "admin") {
        navigate("/admin");
      } else if (result.user.role === "deliveryMan") {
        navigate("/delivery");
      } else {
        navigate("/menu");
      }
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="login-wrapper">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Welcome Back</h2>
        {error && <div className="error-message">{error}</div>}
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />
        <button type="submit">Login</button>
        <p className="switch-auth">
          Don't have an account? <Link to="/register">Sign up here</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
