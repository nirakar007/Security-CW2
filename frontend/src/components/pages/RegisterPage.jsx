import { Lock, Mail, User as UserIcon } from "lucide-react"; // Importing icons
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import zxcvbn from "zxcvbn";
import apiClient from "../../api/apiClient";

// Spinner component for loading state
function Spinner() {
  return (
    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
  );
}

// Password Strength sub-component - Unchanged but vital
const PasswordInput = ({ password, setPassword, strength, setStrength }) => {
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setStrength(zxcvbn(password));
  }, [password, setStrength]);

  const strengthIndicatorColor = () => {
    switch (strength.score) {
      case 0:
        return "bg-red-500/50";
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-yellow-500";
      case 3:
        return "bg-blue-500";
      case 4:
        return "bg-green-500";
      default:
        return "bg-slate-700";
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-300 ml-1">
        Password
      </label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-all duration-300">
          <Lock className="h-5 w-5" />
        </div>
        <input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          required
          placeholder="Enter a strong password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full pl-12 pr-16 py-4 bg-white/5 text-white border border-white/20 rounded-xl focus:outline-none focus:bg-white/10 focus:border-blue-400/80 focus:ring-4 focus:ring-blue-400/10 transition-all duration-300 placeholder:text-slate-400 text-sm font-medium"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white font-semibold text-xs transition-colors"
        >
          {showPassword ? "HIDE" : "SHOW"}
        </button>
      </div>
      {password.length > 0 && (
        <div className="w-full bg-black/20 rounded-full h-1.5 mt-2">
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${strengthIndicatorColor()}`}
            style={{ width: `${(strength.score + 1) * 20}%` }}
          ></div>
        </div>
      )}
      {password.length > 0 && strength.feedback?.suggestions?.[0] && (
        <p className="text-xs text-yellow-300/80 mt-1 ml-1">
          {strength.feedback.suggestions[0]}
        </p>
      )}
    </div>
  );
};

// Main Register Page Component
const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [passwordStrength, setPasswordStrength] = useState({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { email, password, confirmPassword } = formData;
  const onChange = (e) => {
    setError("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      await apiClient.post("/auth/register", { email, password });
      navigate("/login", {
        state: { message: "Registration successful! Please log in." },
      });
    } catch (err) {
      setError(
        err.response?.data?.msg ||
          "An unknown error occurred during registration."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen px-4 py-12 overflow-hidden bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900">
      {/* Animated Background Elements */}
      <div
        className="absolute top-1/2 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-blue-500/30 via-purple-600/30 to-transparent animate-pulse"
        style={{ animationDuration: "8s" }}
      ></div>
      {/* Subtle Grid Pattern */}
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
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-block p-4 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 mb-4">
            <UserIcon className="h-8 w-8 text-blue-400" />
          </div>
          <h2 className="bg-clip-text text-transparent bg-gradient-to-br from-white via-blue-100 to-blue-300 text-4xl font-black tracking-tight">
            Create an Account
          </h2>
          <p className="text-slate-300 text-base font-medium">
            Join us and start sending files securely.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Email Input */}
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
                placeholder="Enter your email"
                value={email}
                onChange={onChange}
                className="w-full pl-12 pr-4 py-4 bg-white/5 text-white border border-white/20 rounded-xl focus:outline-none focus:bg-white/10 focus:border-blue-400/80 focus:ring-4 focus:ring-blue-400/10 transition-all duration-300 placeholder:text-slate-400 text-sm font-medium"
              />
            </div>
          </div>

          {/* Password Input Component */}
          <PasswordInput
            password={password}
            setPassword={(p) => setFormData({ ...formData, password: p })}
            strength={passwordStrength}
            setStrength={setPasswordStrength}
          />

          {/* Confirm Password Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">
              Confirm Password
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-all duration-300">
                <Lock className="h-5 w-5" />
              </div>
              <input
                name="confirmPassword"
                type="password"
                required
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={onChange}
                className="w-full pl-12 pr-4 py-4 bg-white/5 text-white border border-white/20 rounded-xl focus:outline-none focus:bg-white/10 focus:border-blue-400/80 focus:ring-4 focus:ring-blue-400/10 transition-all duration-300 placeholder:text-slate-400 text-sm font-medium"
              />
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

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="group w-full flex justify-center items-center py-4 px-6 border-0 text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-300 ease-out shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:shadow-blue-500/25"
            >
              <span className="flex items-center gap-3">
                {isLoading && <Spinner />}
                <span className="font-semibold tracking-wide">
                  {isLoading ? "Creating Account..." : "Create Account"}
                </span>
              </span>
            </button>
          </div>
        </form>

        <div className="pt-6 border-t border-white/10">
          <p className="text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-blue-400 hover:text-blue-300 transition-colors duration-200 hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
