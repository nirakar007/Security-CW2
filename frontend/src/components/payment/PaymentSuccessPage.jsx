import { CheckCircle } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext"; // <-- Import useAuth

const PaymentSuccessPage = () => {
  const { checkAuthStatus } = useAuth(); // <-- Get the function from context

  // Use useEffect to trigger the status check once when the page loads
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]); // Add checkAuthStatus as a dependency

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white text-center px-4">
      <CheckCircle className="h-24 w-24 text-green-400 mb-6" />
      <h1 className="text-4xl font-bold text-green-400">Payment Successful!</h1>
      <p className="mt-4 text-lg text-slate-300">
        Thank you for upgrading. Your account is now a <strong>Pro</strong>{" "}
        account.
      </p>
      <Link
        to="/dashboard"
        className="mt-8 px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
      >
        Go to Dashboard
      </Link>
    </div>
  );
};

export default PaymentSuccessPage;
