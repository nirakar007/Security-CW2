import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
      <h1 className="text-5xl font-bold">SecureSend</h1>
      <p className="text-xl text-gray-400 mt-2">
        The simplest way to send files securely.
      </p>
      <div className="mt-8 space-x-4">
        <Link
          to="/login"
          className="px-6 py-3 font-bold rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="px-6 py-3 font-bold rounded-md text-slate-900 bg-slate-300 hover:bg-white transition-colors"
        >
          Register
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
