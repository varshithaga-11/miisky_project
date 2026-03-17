import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { FiX, FiUploadCloud, FiFileText, FiTrash2, FiLoader } from "react-icons/fi";
import { toast } from "react-toastify";
import { importFile } from "../../services/importService";
import Button from "../ui/button/Button";

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  module: string;
  submenu: string;
  onSuccess?: () => void;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  module,
  submenu,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<any[]>([]);

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("File size exceeds 5MB limit.");
        return;
      }
      setFile(selectedFile);
      setErrors([]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
      "application/pdf": [".pdf"],
    },
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first.");
      return;
    }

    setUploading(true);
    setErrors([]);

    try {
      const response = await importFile(module, submenu, file);
      if (response.success) {
        toast.success(`Import successful! Created: ${response.created}, Updated: ${response.updated}`);
        if (onSuccess) onSuccess();
        onClose();
        setFile(null);
      } else {
        toast.error(response.message || "Import failed.");
        setErrors(response.errors || []);
      }
    } catch (error: any) {
      const apiErrors = error.response?.data?.errors || [];
      const message = error.response?.data?.message || "An error occurred during upload.";
      toast.error(message);
      setErrors(apiErrors);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Import Records ({submenu})</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <FiX size={24} />
          </button>
        </div>

        <div className="p-6">
          {!file ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all ${
                isDragActive
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
              }`}
            >
              <input {...getInputProps()} />
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-full mb-4 text-blue-600 dark:text-blue-400">
                <FiUploadCloud size={40} />
              </div>
              <p className="text-center text-gray-600 dark:text-gray-300">
                <span className="font-semibold text-blue-600 dark:text-blue-400">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-400 mt-2">XLSX, XLS, or PDF (Max 5MB)</p>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 flex items-center justify-between border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-lg text-blue-600 dark:text-blue-400">
                  <FiFileText size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
              <button
                disabled={uploading}
                onClick={() => setFile(null)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Remove file"
              >
                <FiTrash2 size={18} />
              </button>
            </div>
          )}

          {errors.length > 0 && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/40 overflow-y-auto max-h-40">
              <p className="text-sm font-bold text-red-600 dark:text-red-400 mb-2">Partial Failure Details:</p>
              <ul className="space-y-1 text-xs text-red-600 dark:text-red-400">
                {errors.map((err, i) => (
                  <li key={i}>Row {err.row}: {JSON.stringify(err.errors)}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="p-6 bg-gray-50 dark:bg-gray-900/30 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
          <Button variant="outline" onClick={onClose} disabled={uploading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="min-w-[120px]"
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <FiLoader className="animate-spin" /> Uploading...
              </span>
            ) : (
              "Upload File"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;
