import { LockKeyhole, LogOutIcon, Settings, ShieldCheck, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../api/apiClient";
import { useAuth } from "../context/authContext";
import SimulatedUpgradeCard from "../payment/SimulateUpgradeCard";
import FileList from "../uploads/FileList";
import UploadForm from "../uploads/UploadForm";

import TextType from "../layout/TextType";

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const isProUser = user && user.role === "PRO";

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
    <div
      className={`min-h-screen w-full p-8 transition-colors duration-1000 ${
        isProUser ? "bg-[#110f02]" : "bg-slate-900"
      }`}
    >
      <div className="w-full max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-amber-50">
              <h1 className="text-4xl font-bold ">SecureSend</h1>
              <ShieldCheck className="h-6 w-6 text-amber-50"/>
            </div>
            {/* --- PRO BADGE --- */}
            {isProUser && (
              <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-yellow-300 font-semibold text-sm">
                <Star className="h-4 w-4 fill-yellow-400" />
                Pro
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {" "}
            <Link
              to="/settings"
              className="font-semibold text-slate-300 hover:text-white transition-colors"
            >
              <Settings />
            </Link>
            <button
              onClick={logout}
              className="px-3 py-2 font-bold rounded-lg text-white hover:bg-red-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <LogOutIcon />
            </button>
          </div>
        </header>

        {/* Main Content Grid */}
        <main className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-start items-center gap-2">
              <h1 className="text-3xl font-bold text-amber-50">Welcome,</h1>
              <h1 className="text-amber-50 pt-4 text-lg">
                User with email: {user?.email}
              </h1>
            </div>
            <TextType
              text={["This is your secure dashboard!", "Happy Sharing!"]}
              typingSpeed={75}
              pauseDuration={2000}
              showCursor={true}
              cursorCharacter="|"
            />

            <UploadForm onUploadSuccess={onUploadSuccess} />
            {user && user.role !== "PRO" && <SimulatedUpgradeCard />}
          </div>
          <div className="lg:col-span-3">
            <h2 className="text-3xl font-bold mb-4 text-amber-50">
              Your Files
            </h2>
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
