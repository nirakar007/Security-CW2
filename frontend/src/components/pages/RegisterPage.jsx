import { Link } from "react-router-dom";

const RegisterPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 px-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-slate-800 rounded-2xl shadow-2xl">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-white">
            Create an Account
          </h2>
          <p className="mt-2 text-md text-gray-400">
            Get started with SecureSend today.
          </p>
        </div>
        {/* We will add the full form here later */}
        <p className="text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-blue-400 hover:text-blue-300 hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
