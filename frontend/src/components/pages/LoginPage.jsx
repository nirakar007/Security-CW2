import { Lock, Mail, ShieldCheck, Timer } from "lucide-react"; // Added Timer icon
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";
import { useAuth } from "../context/authContext";

// Spinner component for loading states
function Spinner() {
  return (
    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
  );
}

function LoginPage() {
  // --- STATE MANAGEMENT ---
  const [loginStep, setLoginStep] = useState("credentials");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    otp: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // --- NEW STATE for account lockout ---
  const [lockout, setLockout] = useState({ isLocked: false, endTime: null });
  const [lockoutTimer, setLockoutTimer] = useState("");

  // --- HOOKS ---
  const navigate = useNavigate();
  const { login } = useAuth();
  const location = useLocation();

  // --- NEW useEffect for the lockout timer ---
  useEffect(() => {
    let interval;
    if (lockout.isLocked && lockout.endTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const remaining = lockout.endTime - now;

        if (remaining <= 0) {
          clearInterval(interval);
          setLockout({ isLocked: false, endTime: null });
          setError(""); // Clear the lockout error message
          setLockoutTimer("");
        } else {
          const minutes = Math.floor((remaining / 1000 / 60) % 60);
          const seconds = Math.floor((remaining / 1000) % 60);
          setLockoutTimer(
            `${minutes.toString().padStart(2, "0")}:${seconds
              .toString()
              .padStart(2, "0")}`
          );
        }
      }, 1000);
    }
    // Cleanup function to clear the interval when the component unmounts or state changes
    return () => clearInterval(interval);
  }, [lockout]);

  // Existing useEffect for mount animation and success messages
  useEffect(() => {
    setIsMounted(true);
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      window.history.replaceState({}, document.title);
      return () => clearTimeout(timer);
    }
  }, [location]);

  // --- HANDLERS ---
  const onChange = (e) => {
    setError("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Step 1: Submit email and password
  const handleCredentialSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      await apiClient.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });
      setLoginStep("otp");
    } catch (err) {
      const errorData = err.response?.data;
      setError(errorData?.msg || "Login failed. Please try again.");

      // Check for lockout data in the error response and set the state
      if (errorData?.lockoutUntil) {
        setLockout({
          isLocked: true,
          endTime: new Date(errorData.lockoutUntil).getTime(),
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Submit OTP
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await apiClient.post("/auth/verify-otp", {
        email: formData.email,
        otp: formData.otp,
      });
      const { data: userData } = await apiClient.get("/auth/me");
      login(userData);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.msg || "OTP verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDER LOGIC ---
  const renderCredentialForm = () => (
    <form onSubmit={handleCredentialSubmit} className="space-y-6">
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
            value={formData.email}
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
            value={formData.password}
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
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading || lockout.isLocked} // Disable button during lockout
          className="group w-full flex justify-center items-center mb-2 py-4 px-6 border-0 text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-300 ease-out shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:shadow-blue-500/25"
        >
          <span className="flex items-center gap-3">
            {isLoading && <Spinner />}
            {lockout.isLocked && !isLoading && <Timer className="h-4 w-4" />}
            <span className="font-semibold tracking-wide">
              {isLoading
                ? "Requesting OTP..."
                : lockout.isLocked
                ? `Try Again in ${lockoutTimer}`
                : "Continue"}
            </span>
          </span>
        </button>
        <Link
          to="/forgot-password"
          className="text-sm font-medium text-blue-400 hover:underline"
        >
          Forgot Password?
        </Link>
      </div>
    </form>
  );

  const renderOtpForm = () => (
    <form onSubmit={handleOtpSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300 ml-1">
          Verification Code
        </label>
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-all duration-300">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <input
            name="otp"
            type="text"
            required
            inputMode="numeric"
            maxLength="6"
            className="w-full pl-12 pr-4 py-4 bg-white/5 text-white border border-white/20 rounded-xl focus:outline-none focus:bg-white/10 focus:border-blue-400/80 focus:ring-4 focus:ring-blue-400/10 transition-all duration-300 placeholder:text-slate-400 text-lg font-bold text-center tracking-[0.5em]"
            placeholder="------"
            value={formData.otp}
            onChange={onChange}
          />
        </div>
      </div>
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="group w-full flex justify-center items-center py-4 px-6 border-0 text-sm font-bold rounded-xl text-white bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 focus:outline-none focus:ring-4 focus:ring-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-300 ease-out shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:shadow-green-500/25"
        >
          <span className="flex items-center gap-3">
            {isLoading && <Spinner />}
            <span className="font-semibold tracking-wide">
              {isLoading ? "Verifying..." : "Verify & Sign In"}
            </span>
          </span>
        </button>
      </div>
      <div className="text-center">
        <button
          type="button"
          onClick={() => setLoginStep("credentials")}
          className="text-sm text-slate-400 hover:text-white hover:underline"
        >
          Back to login
        </button>
      </div>
    </form>
  );

  return (
    <div className="relative flex items-center justify-center min-h-screen px-4 py-12 overflow-hidden bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900">
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
            {loginStep === "credentials" ? (
              <Lock className="h-8 w-8 text-blue-400" />
            ) : (
              <ShieldCheck className="h-8 w-8 text-green-400" />
            )}
          </div>
          <h2 className="bg-clip-text text-transparent bg-gradient-to-br from-white via-blue-100 to-blue-300 text-4xl font-black tracking-tight">
            {loginStep === "credentials" ? "Welcome Back" : "Check Your Email"}
          </h2>
          <p className="text-slate-300 text-base font-medium">
            {loginStep === "credentials"
              ? "Sign in to your account to continue"
              : `We sent a code to ${formData.email}`}
          </p>
        </div>

        {loginStep === "credentials" && successMessage && !error && (
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
            <p className="text-green-300 text-sm font-medium">
              {successMessage}
            </p>
          </div>
        )}

        {loginStep === "credentials" ? renderCredentialForm() : renderOtpForm()}

        {error && (
          <div className="relative overflow-hidden p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
            <p className="relative text-red-300 text-sm font-medium text-center">
              {error}
            </p>
          </div>
        )}

        {loginStep === "credentials" && (
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
        )}
      </div>
    </div>
  );
}

export default LoginPage;
