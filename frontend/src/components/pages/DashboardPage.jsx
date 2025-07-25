import { useAuth } from "../context/authContext";
import UploadForm from "../uploads/UploadForm"; // Import the form

const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col items-center min-h-screen bg-slate-900 text-white p-4 pt-10">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {user?.email}</h1>
            <p className="text-slate-400">This is your secure dashboard.</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 font-bold rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Add the upload form here */}
        <UploadForm />

        {/* A list of uploaded files will go here later */}
      </div>
    </div>
  );
};

export default DashboardPage;
