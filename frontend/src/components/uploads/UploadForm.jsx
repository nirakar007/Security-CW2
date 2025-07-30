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

  const onSubmit = async (e) => {
    e.preventDefault();
    setShowUpgrade(false);

    if (!file) {
      setStatus({ message: "Please select a file first.", isError: true });
      return;
    }

    const formData = new FormData();
    formData.append("secureFile", file);
    setIsLoading(true);

    try {
      setStatus({ message: "Uploading...", isError: false });
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
    <div className="w-full p-8 space-y-6 bg-[#0f172a] rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-white">Upload a Secure File</h2>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="flex items-center space-x-4">
          <label
            htmlFor="file-upload"
            className="flex-shrink-0 cursor-pointer px-5 py-2.5 font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Choose File
          </label>
          <input
            id="file-upload"
            type="file"
            onChange={onFileChange}
            className="hidden"
          />
          <span className="text-slate-400 truncate">
            {file ? file.name : "No file chosen"}
          </span>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-4 py-3 px-4 flex justify-center items-center gap-2 font-bold rounded-lg text-white bg-blue-700 hover:bg-blue-800 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
        >
          <UploadCloud className="h-5 w-5" />
          {isLoading ? "Uploading..." : "Upload"}
        </button>
      </form>
      {showUpgrade && (
        <div className="mt-4">
          <p className="text-center text-sm text-yellow-400 mb-2">
            Upgrade required for files over 10MB.
          </p>
          {/* Here you could link to a pricing page or directly trigger the payment flow */}
          {/* For now, we'll just show the user needs to upgrade. */}
          {/* In a real app, you would render the <UpgradeCard /> here or navigate. */}
        </div>
      )}
      {status.message && (
        <p
          className={`mt-4 text-center text-sm ${
            status.isError ? "text-red-400" : "text-green-400"
          }`}
        >
          {status.message}
        </p>
      )}
    </div>
  );
};

export default UploadForm;
