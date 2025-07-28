import { useEffect, useState } from "react";
import apiClient from "../../api/apiClient";
import { useAuth } from "../context/authContext";
import FileList from "../uploads/FileList";
import UploadForm from "../uploads/UploadForm";

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get("/files");
      setFiles(response.data);
    } catch (err) {
      setError("Could not fetch files. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const onUploadSuccess = () => {
    fetchFiles();
  };

  return (
    <div className="min-h-screen w-full bg-[#1e293b] text-white p-8">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold">Welcome, {user?.email}</h1>
            <p className="text-slate-400 text-lg mt-1">
              This is your secure dashboard.
            </p>
          </div>
          <button
            onClick={logout}
            className="px-6 py-2 font-bold rounded-lg text-white bg-red-600 hover:bg-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Logout
          </button>
        </header>

        {/* Main Content Grid */}
        <main className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <UploadForm onUploadSuccess={onUploadSuccess} />
          </div>
          <div className="lg:col-span-3">
            <h2 className="text-3xl font-bold mb-4">Your Files</h2>
            {isLoading ? (
              <p>Loading files...</p>
            ) : error ? (
              <p className="text-red-400">{error}</p>
            ) : (
              <FileList files={files} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
