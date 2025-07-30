import { CheckCircle, Clock, KeyRound, Shield, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../api/apiClient";
import { useAuth } from "../context/authContext";

const ChangePasswordForm = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [message, setMessage] = useState({ text: "", isError: false });

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "Updating...", isError: false });
    try {
      const response = await apiClient.post("/user/change-password", formData);
      setMessage({ text: response.data.msg, isError: false });
      setFormData({ currentPassword: "", newPassword: "" });
    } catch (error) {
      setMessage({
        text: error.response?.data?.msg || "An error occurred.",
        isError: true,
      });
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-300">
          Current Password
        </label>
        <input
          type="password"
          name="currentPassword"
          value={formData.currentPassword}
          onChange={onChange}
          required
          className="w-full mt-1 p-2 bg-slate-700 rounded-md"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-300">
          New Password
        </label>
        <input
          type="password"
          name="newPassword"
          value={formData.newPassword}
          onChange={onChange}
          required
          className="w-full mt-1 p-2 bg-slate-700 rounded-md"
        />
      </div>
      <button
        type="submit"
        className="w-full py-2 bg-blue-600 rounded-md font-semibold"
      >
        Change Password
      </button>
      {message.text && (
        <p
          className={`text-center text-sm ${
            message.isError ? "text-red-400" : "text-green-400"
          }`}
        >
          {message.text}
        </p>
      )}
    </form>
  );
};

const SettingsPage = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [transRes, logsRes] = await Promise.all([
          apiClient.get("/payment/transactions"),
          apiClient.get("/user/activity"),
        ]);
        setTransactions(transRes.data);
        setActivityLogs(logsRes.data);
      } catch (error) {
        console.error("Failed to fetch settings data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
    // to re-fetch data whenever the window gains focus : handles the case where the user navigates away and then comes back.
    window.addEventListener("focus", fetchData);
    // Cleanup function: It's crucial to remove the event listener
    // when the component unmounts to prevent memory leaks
    return () => {
      window.removeEventListener("focus", fetchData);
    };
  }, []);

  const isProUser = user && user.role === "PRO";

  return (
    <div className="min-h-screen w-full bg-slate-900 text-white p-8">
      <div className="w-full max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold">Account Settings</h1>
          <p className="text-slate-400 text-lg mt-1">
            Manage your plan, security, and view activity.
          </p>
          <Link
            to="/dashboard"
            className="text-blue-400 hover:underline mt-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column for Plan & Security */}
          <div className="lg:col-span-1 space-y-8">
            <section className="bg-slate-800 p-6 rounded-xl">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" /> Your Plan
              </h2>
              <div
                className={`text-2xl font-semibold ${
                  isProUser ? "text-yellow-300" : ""
                }`}
              >
                {isProUser ? "SecureSend Pro" : "Free Tier"}
              </div>
              <p className="text-slate-400 mt-2 text-sm">
                {isProUser ? "Uploads up to 5MB." : "Uploads up to 2.5MB."}
              </p>
            </section>

            <section className="bg-slate-800 p-6 rounded-xl">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-blue-400" /> Change Password
              </h2>
              <ChangePasswordForm />
            </section>
          </div>

          {/* Right Column for History */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-slate-800 p-6 rounded-xl">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" /> Billing
                History
              </h2>
              {isLoading ? (
                <p>Loading...</p>
              ) : transactions.length > 0 ? (
                <div className="overflow-x-auto max-h-60">
                  <table className="w-full text-left text-sm">
                    {/* ... table from previous version ... */}
                  </table>
                </div>
              ) : (
                <p className="text-slate-400 text-sm">
                  No transaction history.
                </p>
              )}
            </section>

            <section className="bg-slate-800 p-6 rounded-xl">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-400" /> Activity Log
              </h2>
              {isLoading ? (
                <p>Refreshing data...</p>
              ) : activityLogs.length > 0 ? (
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {activityLogs.map((log) => (
                    <div key={log._id} className="flex items-start gap-4">
                      <div className="bg-slate-700 p-2 rounded-full">
                        <Shield className="h-4 w-4 text-slate-300" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">
                          {log.action.replace(/_/g, " ")}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(log.createdAt).toLocaleString()} • IP:{" "}
                          {log.ipAddress}
                        </p>
                        {log.details && (
                          <p className="text-sm text-slate-300 mt-1">
                            {log.details}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm">No recent activity.</p>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
