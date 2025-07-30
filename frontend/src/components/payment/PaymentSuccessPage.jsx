import { Link } from "react-router-dom";
const PaymentSuccessPage = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
    <h1 className="text-4xl font-bold text-green-400">Payment Successful!</h1>
    <p className="mt-4 text-lg">Thank you for upgrading to SecureSend Pro.</p>
    <Link to="/dashboard" className="mt-8 px-6 py-3 bg-blue-600 rounded-lg">
      Go to Dashboard
    </Link>
  </div>
);
export default PaymentSuccessPage;
