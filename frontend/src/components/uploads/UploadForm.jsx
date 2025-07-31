import { UploadCloud } from "lucide-react";
import { useState } from "react";
import apiClient from "../../api/apiClient";

const UploadForm = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState({ message: "", isError: false });
  const [isLoading, setIsLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const onFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStatus({ message: "", isError: false });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setStatus({ message: "Please select a file first.", isError: true });
      return;
    }

    const formData = new FormData();
    formData.append("secureFile", file);

    setIsLoading(true);
    setStatus({ message: "Uploading...", isError: false });

    try {
      await apiClient.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setStatus({ message: "Upload successful!", isError: false });
      if (onUploadSuccess) {
        onUploadSuccess();
      }
      setFile(null);
      e.target.reset();
    } catch (err) {
      const errorData = err.response?.data;
      setStatus({
        message: err.response?.data?.msg || "Upload failed. Please try again.",
        isError: true,
      });
      if (errorData?.upgradeRequired) {
        setShowUpgrade(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="w-full max-w-md p-8 space-y-6 rounded-xl shadow-2xl backdrop-blur-xl border border-white/20 relative overflow-hidden"
      style={{
        background: "rgba(15, 23, 42, 0.4)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      {/* Glass reflection effect */}
      <div
        className="absolute inset-0 rounded-xl opacity-30"
        style={{
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.05) 100%)",
        }}
      />

      <div className="relative z-10">
        <h2 className="text-3xl font-bold text-white mb-6">
          Upload a Secure File
        </h2>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="flex items-center space-x-4">
            <label
              htmlFor="file-upload"
              className="flex-shrink-0 cursor-pointer px-5 py-2.5 font-semibold rounded-lg text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all duration-200"
            >
              Choose File
            </label>
            <input
              id="file-upload"
              type="file"
              onChange={onFileChange}
              className="hidden"
            />
            <span className="text-slate-300 truncate">
              {file ? file.name : "No file chosen"}
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 py-3 px-4 flex justify-center items-center gap-2 font-bold rounded-lg text-white bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed backdrop-blur-sm border border-white/20 transition-all duration-200"
          >
            <UploadCloud className="h-5 w-5" />
            {isLoading ? "Uploading..." : "Upload"}
          </button>
        </form>

        {showUpgrade && (
          <div className="mt-4 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 backdrop-blur-sm">
            <p className="text-center text-sm text-yellow-300 mb-2">
              Upgrade required for files over 10MB.
            </p>
          </div>
        )}

        {status.message && (
          <p
            className={`mt-4 text-center text-sm ${
              status.isError ? "text-red-300" : "text-green-300"
            }`}
          >
            {status.message}
          </p>
        )}
      </div>

      {/* Additional glass shine effect */}
      <div
        className="absolute top-0 left-0 w-full h-full rounded-xl opacity-20 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 30%, transparent 70%, rgba(255, 255, 255, 0.1) 100%)",
        }}
      />

      {/* Custom CSS for border glow animation */}
      <style jsx>{`
        @keyframes borderGlow {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </div>
  );
};

export default UploadForm;
