import { CheckCircle, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../api/apiClient";
import { useAuth } from "../context/authContext";

const SettingsPage = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await apiClient.get("/payment/transactions");
        setTransactions(response.data);
      } catch (error) {
        console.error("Failed to fetch transactions", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const isProUser = user && user.role === "PRO";

  return (
    <div className="min-h-screen w-full bg-slate-900 text-white p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold">Account Settings</h1>
          <p className="text-slate-400 text-lg mt-1">
            Manage your plan and view billing history.
          </p>
          <Link
            to="/dashboard"
            className="text-blue-400 hover:underline mt-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
        </header>

        <main className="space-y-10">
          {/* Current Plan Section */}
          <section className="bg-slate-800 p-8 rounded-xl">
            <h2 className="text-2xl font-bold mb-4">Your Current Plan</h2>
            {isProUser ? (
              <div className="flex items-center gap-4 text-yellow-300">
                <Star className="h-8 w-8" />
                <span className="text-2xl font-semibold">SecureSend Pro</span>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <span className="text-2xl font-semibold">Free Tier</span>
              </div>
            )}
            <p className="text-slate-400 mt-2">
              {isProUser
                ? "You have access to all premium features, including file uploads up to 5MB."
                : "You can upload files up to 2.5MB."}
            </p>
          </section>

          {/* Billing History Section */}
          <section className="bg-slate-800 p-8 rounded-xl">
            <h2 className="text-2xl font-bold mb-4">Billing History</h2>
            {isLoading ? (
              <p>Loading transaction history...</p>
            ) : transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm whitespace-nowrap">
                  <thead className="border-b border-slate-700 text-slate-400">
                    <tr>
                      <th className="p-4">Date</th>
                      <th className="p-4">Description</th>
                      <th className="p-4 text-right">Amount</th>
                      <th className="p-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx._id} className="border-b border-slate-700">
                        <td className="p-4">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 font-medium text-white">
                          {tx.productName}
                        </td>
                        <td className="p-4 text-right font-mono">
                          ${(tx.amount / 100).toFixed(2)}{" "}
                          {tx.currency.toUpperCase()}
                        </td>
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-300">
                            <CheckCircle className="h-4 w-4" />
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-400">You have no transaction history.</p>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
