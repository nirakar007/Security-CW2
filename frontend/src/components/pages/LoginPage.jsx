import { Lock, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // Import useLocation
import apiClient from "../../api/apiClient"; // Import our API client
import { useAuth } from "../context/AuthContext";

function Spinner() {
  return (
    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
  );
}

function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // For registration success message
  const [isMounted, setIsMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();
  const location = useLocation(); // Hook to access route state

  useEffect(() => {
    setIsMounted(true);
    // Check if we were redirected from the registration page
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Optional: Clear the message after a few seconds
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      // Clear the state from history so the message doesn't reappear on back navigation
      window.history.replaceState({}, document.title);
      return () => clearTimeout(timer);
    }
  }, [location]);

  const { email, password } = formData;

  const onChange = (e) => {
    setError(""); // Clear errors on new input
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage(""); // Clear success message on new attempt

    try {
      const response = await apiClient.post("/auth/login", { email, password });
      // The "me" endpoint returns the full user data, let's use that
      const { data: userData } = await apiClient.get("/auth/me");
      login(userData); // Update the global state
      navigate("/dashboard"); // Redirect to dashboard on success
    } catch (err) {
      setError(err.response?.data?.msg || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen px-4 py-12 overflow-hidden bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900">
      {/* ... (The rest of your beautiful UI code is unchanged) ... */}
      <div className="absolute top-20 -left-32 w-96 h-96 bg-gradient-to-br from-blue-500 to-purple-600 opacity-20 rounded-full animate-pulse"></div>
      <div
        className="absolute bottom-20 -right-32 w-80 h-80 bg-gradient-to-tr from-violet-500 to-pink-500 opacity-25 rounded-full animate-bounce"
        style={{ animationDuration: "3s" }}
      ></div>
      <div
        className="absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-bl from-cyan-400 to-blue-600 opacity-15 rounded-full animate-ping"
        style={{ animationDuration: "4s" }}
      ></div>
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
          backgroundSize: "50px 50px",
        }}
      />

      <div
        className={`w-full max-w-md p-10 space-y-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl z-10 transform transition-all duration-1000 ease-out ${
          isMounted
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-8 scale-95"
        }`}
      >
        <div className="text-center space-y-3">
          <div className="inline-block p-4 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 mb-4 animate-pulse">
            <Lock className="h-8 w-8 text-blue-400" />
          </div>
          <h2 className="bg-clip-text text-transparent bg-gradient-to-br from-white via-blue-100 to-blue-300 text-4xl font-black tracking-tight">
            Welcome Back
          </h2>
          <p className="text-slate-300 text-base font-medium">
            Sign in to your account to continue
          </p>
        </div>

        {/* Success Message Display */}
        {successMessage && !error && (
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
            <p className="text-green-300 text-sm font-medium">
              {successMessage}
            </p>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-all duration-300">
                <Mail className="h-5 w-5" />
              </div>
              <input
                name="email"
                type="email"
                required
                className="w-full pl-12 pr-4 py-4 bg-white/5 text-white border border-white/20 rounded-xl focus:outline-none focus:bg-white/10 focus:border-blue-400/80 focus:ring-4 focus:ring-blue-400/10 transition-all duration-300 placeholder:text-slate-400 text-sm font-medium"
                placeholder="Enter your email"
                value={email}
                onChange={onChange}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">
              Password
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-all duration-300">
                <Lock className="h-5 w-5" />
              </div>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className="w-full pl-12 pr-16 py-4 bg-white/5 text-white border border-white/20 rounded-xl focus:outline-none focus:bg-white/10 focus:border-blue-400/80 focus:ring-4 focus:ring-blue-400/10 transition-all duration-300 placeholder:text-slate-400 text-sm font-medium"
                placeholder="Enter your password"
                value={password}
                onChange={onChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white font-semibold text-xs transition-colors"
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          {error && (
            <div className="relative overflow-hidden p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
              <p className="relative text-red-300 text-sm font-medium text-center">
                {error}
              </p>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="group w-full flex justify-center items-center py-4 px-6 border-0 text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-300 ease-out shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:shadow-blue-500/25"
            >
              <span className="flex items-center gap-3">
                {isLoading && <Spinner />}
                <span className="font-semibold tracking-wide">
                  {isLoading ? "Signing In..." : "Sign In"}
                </span>
              </span>
            </button>
          </div>
        </form>

        <div className="pt-6 border-t border-white/10">
          <p className="text-center text-sm text-slate-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-blue-400 hover:text-blue-300 transition-colors duration-200 hover:underline"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
