import { Archive, Check, Copy, FileCode, FileText, Image } from "lucide-react";
import { useState } from "react";
import apiClient from "../../api/apiClient";

// Helper to format file size from bytes to a readable string
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Helper to choose an icon based on MIME type
const getFileIcon = (mimeType) => {
  if (mimeType.startsWith("image/"))
    return <Image className="h-6 w-6 text-blue-400" />;
  if (mimeType === "application/pdf")
    return <FileText className="h-6 w-6 text-red-400" />;
  if (
    mimeType.startsWith("application/zip") ||
    mimeType.startsWith("application/x-zip")
  )
    return <Archive className="h-6 w-6 text-yellow-400" />;
  return <FileCode className="h-6 w-6 text-gray-400" />;
};

const FileList = ({ files }) => {
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGetLink = async (fileId) => {
    try {
      const response = await apiClient.post(`/files/generate-link/${fileId}`);
      setLink(response.data.downloadLink);
    } catch (error) {
      console.error("Could not generate link", error);
      alert("Error generating link.");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  };

  if (!files || files.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-full min-h-[200px] text-center py-10 px-6 rounded-xl"
        style={{
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.05) 100%)",
        }}
      >
        <p className="text-slate-100 text-lg">
          You haven't uploaded any files yet.
        </p>
      </div>
    );
  }

  // --- Modal for displaying the link ---
  const LinkModal = () => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-slate-800 p-8 rounded-lg shadow-xl max-w-lg w-full">
        <h3 className="text-xl font-bold mb-4">Your Secure Link is Ready</h3>
        <p className="text-slate-400 mb-4">
          This is a one-time download link. It will expire in 24 hours and will
          be disabled after the first download.
        </p>
        <div className="flex items-center space-x-2 bg-slate-900 p-2 rounded-md">
          <input
            type="text"
            value={link}
            readOnly
            className="bg-transparent text-white w-full outline-none"
          />
          <button
            onClick={handleCopyLink}
            className="p-2 bg-blue-600 rounded-md hover:bg-blue-700"
          >
            {copied ? (
              <Check className="h-5 w-5" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
          </button>
        </div>
        <button
          onClick={() => setLink("")}
          className="w-full mt-6 py-2 bg-slate-600 rounded-md hover:bg-slate-700"
        >
          Close
        </button>
      </div>
    </div>
  );

  return (
    <>
      {link && <LinkModal />}

      <div
        className="bg-slate-800 rounded-lg shadow-inner overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.05) 100%)",
        }}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-900/50 uppercase tracking-wider text-slate-400">
              <tr>
                <th scope="col" className="p-4"></th>
                <th scope="col" className="p-4">
                  Name
                </th>
                <th scope="col" className="p-4">
                  Date Uploaded
                </th>
                <th scope="col" className="p-4">
                  Size
                </th>
                <th scope="col" className="p-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr
                  key={file._id}
                  className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors"
                >
                  <td className="p-4">{getFileIcon(file.mimeType)}</td>
                  <td className="p-4 font-medium text-white truncate max-w-xs">
                    {file.originalName}
                  </td>
                  <td className="p-4 text-slate-400">
                    {new Date(file.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-slate-400">
                    {formatFileSize(file.fileSize)}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleGetLink(file._id)}
                      className="font-semibold text-blue-500 hover:text-blue-400 underline"
                    >
                      Get Link
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default FileList;
