import DOMPurify from "dompurify";
import { Gem, Star, Zap } from "lucide-react"; // Added Zap and Gem for other plans
import { useState } from "react";
import apiClient from "../../api/apiClient";
import { useAuth } from "../context/authContext";

// Reusable Spinner component for the loading state
const Spinner = () => (
  <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900"></div>
);

// --- Complete Plan Data Array ---
const plans = [
  {
    name: "Plus",
    price: "Rs500",
    icon: <Star className="h-5 w-5 text-yellow-300" />,
    color: "yellow",
  },
  {
    name: "Premium",
    price: "Rs1000",
    icon: <Zap className="h-5 w-5 text-sky-300" />,
    color: "sky",
  },
  {
    name: "Business",
    price: "Rs2000",
    icon: <Gem className="h-5 w-5 text-fuchsia-300" />,
    color: "fuchsia",
  },
];

// Classes needed for Tailwind's JIT compiler. DO NOT REMOVE.
// border-yellow-400 bg-yellow-500/10
// border-sky-400 bg-sky-500/10
// border-fuchsia-400 bg-fuchsia-500/10

const SimulatedUpgradeCard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("Plus"); // Default to the first plan
  const { checkAuthStatus } = useAuth();

  const handleSimulate = async () => {
    setIsLoading(true);
    setMessage("");
    setIsSuccess(false);

    try {
      const response = await apiClient.post("/payment/simulate-upgrade", {
        planName: selectedPlan,
      });

      // For the "vulnerable" screenshot, you would use:
      // setMessage(response.data.msg);

      // For the "fixed" screenshot and final code, you MUST use DOMPurify:
      const sanitizedMessage = DOMPurify.sanitize(response.data.msg);
      setMessage(sanitizedMessage);

      setIsSuccess(true);
      await checkAuthStatus();
    } catch (error) {
      setMessage(
        error.response?.data?.msg || "An error occurred during the simulation."
      );
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="group relative w-full p-8 space-y-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 shadow-lg transition-all duration-500 overflow-hidden">
        {/* Shine overlay effect */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background:
              "linear-gradient(120deg, transparent 30%, rgba(255, 255, 255, 0.2) 50%, transparent 70%)",
            backgroundSize: "200% 100%",
            animation: "shine 3s ease-in-out infinite",
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          <h3 className="text-2xl font-bold text-white text-center">
            Upgrade to Pro
          </h3>
          <p className="text-slate-400 text-center mt-2">
            Select a plan to test the upgrade flow and XSS protection.
          </p>

          {/* --- Multi-Tier Plan Selection UI --- */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                onClick={() =>
                  !isLoading && !isSuccess && setSelectedPlan(plan.name)
                }
                className={`p-4 rounded-xl text-center border-2 transition-all duration-300 ${
                  selectedPlan === plan.name
                    ? `border-${plan.color}-400 bg-${plan.color}-500/10 scale-105 shadow-lg`
                    : "border-slate-700 hover:border-slate-500 cursor-pointer"
                }`}
              >
                <div className="flex justify-center mb-2">{plan.icon}</div>
                <p className="font-semibold text-white">{plan.name}</p>
                <p className="text-xs text-slate-400">{plan.price}</p>
              </div>
            ))}
          </div>

          <button
            onClick={handleSimulate}
            disabled={isLoading || isSuccess}
            className="w-full mt-6 py-3 px-6 flex justify-center items-center font-semibold rounded-xl bg-yellow-500 text-slate-900 hover:bg-yellow-400 active:bg-yellow-300 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            {isLoading ? (
              <Spinner />
            ) : isSuccess ? (
              "Upgrade Successful!"
            ) : (
              `Upgrade to ${selectedPlan}`
            )}
          </button>

          {/* Display success or error message using dangerouslySetInnerHTML for the sanitized content */}
          {message && (
            <div
              className={`text-center text-sm mt-4 p-3 rounded-lg font-medium ${
                isSuccess
                  ? "bg-green-500/10 text-green-300"
                  : "bg-red-500/10 text-red-400"
              }`}
              dangerouslySetInnerHTML={{ __html: message }}
            />
          )}
        </div>

        {/* Subtle inner glow on hover */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent" />
        </div>
      </div>

      {/* Custom CSS for shine animation */}
      <style>{`
        @keyframes shine {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
};

export default SimulatedUpgradeCard;
