import { useState } from "react";
import apiClient from "../../api/apiClient";

const UploadForm = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(""); // To show upload status

  const onFileChange = (e) => {
    setFile(e.target.files[0]);
    setStatus("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setStatus("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("secureFile", file); // 'secureFile' must match the backend

    try {
      setStatus("Uploading...");
      await apiClient.post("/files/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setStatus("Upload successful!");
    } catch (err) {
      setStatus(
        err.response?.data?.msg ||
          "Upload failed.Invalid File Type! Only images, pdfs, docs, and zips are allowed"
      );
    }
  };

  return (
    <div className="w-full max-w-lg p-8 space-y-4 bg-slate-800 rounded-lg">
      <h2 className="text-2xl font-bold text-white">Upload a Secure File</h2>
      <form onSubmit={onSubmit}>
        <input
          type="file"
          onChange={onFileChange}
          className="block w-full text-sm text-slate-400
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-full file:border-0
                     file:text-sm file:font-semibold
                     file:bg-blue-50 file:text-blue-700
                     hover:file:bg-blue-100"
        />
        <button
          type="submit"
          className="w-full mt-4 py-2 px-4 font-bold rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Upload
        </button>
      </form>
      {status && (
        <p className="mt-4 text-center text-sm text-gray-300">{status}</p>
      )}
    </div>
  );
};

export default UploadForm;
