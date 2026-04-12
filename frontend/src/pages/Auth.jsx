import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../assets/css/auth.css";
import InputField from "../components/InputField";
import { RiHome7Fill } from "react-icons/ri";
import LoginImg from "../assets/images/login.webp";
import RegisterImg from "../assets/images/register.webp";
import { useAuth } from "../contexts/AuthContext";

// API Base URL (adjust for production)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/auth";

export default function Auth({ mode }) {
  const { login } = useAuth();
  // * Detect current route (login or register page)
  const isLogin = mode === "login";

  // ! UI TEXT CONDITIONS (changes everything based on route)
  const headTitle = isLogin
    ? "Glad To See You Again!"
    : "Excited To Have You Here!";
  const headSubtitle = isLogin
    ? "Login to your account"
    : "Register to get started";
  const submitText = isLogin ? "Login" : "Register";
  const otherAuthText = isLogin
    ? "Don't have an account?"
    : "Already have an account?";
  const otherAuthLink = isLogin ? "/register" : "/login";
  const otherAuthLinkText = isLogin ? "Register" : "Log In";

  // * Image changes depending on auth mode
  const sideImage = isLogin ? LoginImg : RegisterImg;

  // * Form state (depends on login/register structure)
  const [formData, setFormData] = useState(
    isLogin
      ? { email: "", password: "" }
      : { firstName: "", lastName: "", email: "", password: "" },
  );

  // * Loading and error state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // * Navigation
  const navigate = useNavigate();

  // ! Reset form when switching between login/register pages
  useEffect(() => {
    setFormData(
      isLogin
        ? { email: "", password: "" }
        : { firstName: "", lastName: "", email: "", password: "" },
    );
    // Clear errors when switching
    setError("");
    setSuccessMessage("");
  }, [isLogin]);

  // * Clear messages after 5 seconds
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError("");
        setSuccessMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  // * Handle input changes dynamically
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // * Validation rules for each field type
  const isValid = (field, data) => {
    switch (field) {
      case "firstName":
        return data.firstName?.length > 1;
      case "lastName":
        return data.lastName?.length > 1;
      case "email":
        return /\S+@\S+\.\S+/.test(data.email);
      case "password":
        // ! password rules differ between login and register
        return isLogin ? data.password.length > 0 : data.password.length >= 8;
      default:
        return false;
    }
  };

  const fieldsData = {
    login: [
      {
        name: "email",
        label: "Email",
        type: "email",
        placeholder: "e.g. weare@replay.com",
        isValid: (data) => isValid("email", data),
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        inputClass: "password-ctr",
        placeholder: "e.g. WeAreReplay",
        isValid: (data) => isValid("password", data),
      },
    ],
    register: [
      {
        name: "firstName",
        label: "First Name",
        placeholder: "e.g. John",
        isValid: (data) => isValid("firstName", data),
      },
      {
        name: "lastName",
        label: "Last Name",
        placeholder: "e.g. Doe",
        isValid: (data) => isValid("lastName", data),
      },
      {
        name: "email",
        label: "Email",
        type: "email",
        placeholder: "e.g. johndoe@replay.com",
        isValid: (data) => isValid("email", data),
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        inputClass: "password-ctr",
        placeholder: "e.g. JohnDoe01",
        hint: "Must be at least 8 characters",
        isValid: (data) => isValid("password", data),
      },
    ],
  };

  // * Choose correct field set based on page
  const fields = isLogin ? fieldsData.login : fieldsData.register;

  // * Check if ALL fields are valid before enabling submit
  const isFormValid = fields.every((f) => f.isValid(formData));

  // ! SUBMIT HANDLER (connects to backend API)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ! Prevent submission if form is invalid or loading
    if (!isFormValid || loading) return;

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      // Determine endpoint based on mode
      const endpoint = isLogin ? "/login" : "/register";
      const url = `${API_URL}${endpoint}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      // Success - store token and user data using AuthContext
      if (data.data) {
        // Use AuthContext login function to store auth data
        login(data.data.user, data.data.token, data.data.role);

        setSuccessMessage(data.message || (isLogin ? "Login successful!" : "Registration successful!"));

        // Redirect based on role after a short delay
        // Admin users → /dashboard, Regular users → /
        setTimeout(() => {
          if (data.data.role === 'admin') {
            navigate("/dashboard", { replace: true });
          } else {
            navigate("/", { replace: true });
          }
        }, 1000);
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-main">
      <div className="auth-ctr">
        <form onSubmit={handleSubmit}>
          {
            // * Header section
          }
          <div className="head">
            <h1>{headTitle}</h1>
            <p>{headSubtitle}</p>
          </div>
          {
            // * Input fields
          }
          <ul className="fields-ctr">
            {fields.map((field) => (
              <InputField
                key={field.name}
                label={field.label}
                name={field.name}
                type={field.type}
                placeholder={field.placeholder}
                value={formData[field.name] ?? ""}
                onChange={handleChange}
                isValid={field.isValid(formData)}
                inputClass={field.inputClass}
                hint={field.hint}
              />
            ))}
          </ul>

          {
            // * Error and Success Messages
          }
          {error && (
            <div className="auth-message auth-message--error">
              <span>{error}</span>
            </div>
          )}
          {successMessage && (
            <div className="auth-message auth-message--success">
              <span>{successMessage}</span>
            </div>
          )}

          {
            // * Back Home and Submit Button
          }
          <ul className="opts-ctr">
            <li>
              <Link to="/">
                <RiHome7Fill className="icon" />
                <span>Home</span>
              </Link>
            </li>
            <li>
              <button type="submit" disabled={!isFormValid || loading}>
                <span>{loading ? "Processing..." : submitText}</span>
              </button>
            </li>
          </ul>
        </form>

        {
          // * Switch between login/register
        }
        <p className="switch-auth">
          <span>{otherAuthText} </span>
          <Link to={otherAuthLink}>{otherAuthLinkText}</Link>
        </p>
      </div>

      {
        // * Side Illustration
      }
      <aside className="auth-img">
        <img
          src={sideImage}
          alt="Auth illustration"
          loading="eager"
          decoding="async"
        />
      </aside>
    </main>
  );
}
