import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";

const Spinner = () => (
  <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

const ForgotPasswordPage = () => {
  const [step, setStep] = useState("email"); // 'email', 'otp', or 'success'
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const response = await apiClient.post("/auth/forgot-password", {
        email: formData.email,
      });
      setMessage(response.data.msg);
      setStep("otp");
    } catch (err) {
      setError(err.response?.data?.msg || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const response = await apiClient.post("/auth/reset-password", {
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword,
      });
      setMessage(response.data.msg);
      setStep("success");
    } catch (err) {
      setError(err.response?.data?.msg || "Password reset failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-slate-800 rounded-2xl shadow-lg">
        {step === "email" && (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Forgot Password</h2>
            <p className="text-slate-400">
              Enter your email address and we'll send you an OTP to reset your
              password.
            </p>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={onChange}
              placeholder="Your email"
              required
              className="w-full p-3 bg-slate-700 rounded-md text-gray-200"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 text-gray-100 rounded-md font-bold"
            >
              {isLoading ? <Spinner /> : "Send OTP"}
            </button>
          </form>
        )}
        {step === "otp" && (
          <form onSubmit={handleResetSubmit} className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Reset Password</h2>
            <p className="text-slate-300">{message}</p>
            <input
              name="otp"
              type="text"
              value={formData.otp}
              onChange={onChange}
              placeholder="6-Digit OTP"
              required
              className="w-full p-3 bg-slate-700 text-gray-200 rounded-md text-center tracking-[0.5em]"
            />
            <input
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={onChange}
              placeholder="New Password"
              required
              className="w-full p-3 bg-slate-700 rounded-md text-gray-200"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-green-600 text-gray-200 rounded-md font-bold"
            >
              {isLoading ? <Spinner /> : "Reset Password"}
            </button>
          </form>
        )}
        {step === "success" && (
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold text-green-400">Success!</h2>
            <p className="text-slate-300">{message}</p>
            <Link
              to="/login"
              className="block w-full py-3 bg-blue-700 text-gray-300 rounded-md font-bold"
            >
              {isLoading ? <Spinner /> : "Back to Login"}
            </Link>
          </div>
        )}
        {error && <p className="text-center text-red-400">{error}</p>}
        <div className="text-center">
          <Link to="/login" className="text-sm text-slate-400 hover:underline">
            Remembered your password?{" "}
            <span className="text-blue-500">Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
