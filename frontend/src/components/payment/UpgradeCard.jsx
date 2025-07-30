import { loadStripe } from "@stripe/stripe-js";
import { Star } from "lucide-react";
import { useState } from "react";
import apiClient from "../../api/apiClient";

const stripePromise = loadStripe(
  "pk_test_51RqHrpKPThj0E6HF7w6Zwb62rMM8DPa2x3SjbUosM7nQsPTLbMNlSxCwQbS346ZLY1wvwX0mT3sBN4K5f5DAqalu00269pBT8Z"
);

const UpgradeCard = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const stripe = await stripePromise;
      // 1. Create a checkout session on your backend
      const response = await apiClient.post("/payment/create-checkout-session");
      const { url } = response.data;
      // 2. Redirect to Stripe's hosted checkout page
      window.location.href = url;
    } catch (error) {
      console.error("Could not initiate Stripe checkout", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full p-6 space-y-4 bg-gradient-to-br hover:border-2 hover:border-amber-200 transition-all duration-200 from-gray-900 to-indigo-800 rounded-xl shadow-lg text-white">
      <div className="flex items-center gap-4">
        <Star className="h-8 w-8 text-yellow-300" />
        <h3 className="text-2xl font-bold">Go Pro!</h3>
      </div>
      <p className="text-blue-100">
        Upload files up to 50MB and get access to future premium features.
      </p>
      <button
        onClick={handleUpgrade}
        disabled={isLoading}
        className="w-full py-2.5 font-bold rounded-lg bg-white text-blue-700 hover:bg-slate-200 transition-colors disabled:opacity-70"
      >
        {isLoading ? "Redirecting..." : "Upgrade Now for $5"}
      </button>
    </div>
  );
};

export default UpgradeCard;
