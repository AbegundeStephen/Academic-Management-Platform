"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { AppDispatch } from "@/app/store/store";
import { submitAssignment } from "@/app/store/slices/assignmentSlice";
import toast from "react-hot-toast";
import { useDispatch} from "react-redux";

interface AssignmentUploaderProps {
  assignmentId: string;
  onUploadComplete?: () => void;
}

export default function AssignmentUploader({
  assignmentId,
  onUploadComplete,
}: AssignmentUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [textSubmission, setTextSubmission] = useState("");
  const [uploading, setUploading] = useState(false);
  const dispatch: AppDispatch = useDispatch<AppDispatch>();
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
    },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleSubmit = async () => {
    if (!textSubmission && files.length === 0) {
      toast.error("Please provide either text submission or upload files");
      return;
    }

    setUploading(true);
    const formData = new FormData();

    if (textSubmission) {
      formData.append("content", textSubmission);
    }

    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      await dispatch(submitAssignment({ assignmentId, formData }));
      toast.success("Assignment submitted successfully!");
      setFiles([]);
      setTextSubmission("");
      onUploadComplete?.();
    } catch (error) {
      toast.error("Failed to submit assignment");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Submit Assignment</h3>

      <div className="space-y-4">
        <div>
          <label className="form-label">Text Submission</label>
          <textarea
            value={textSubmission}
            onChange={(e) => setTextSubmission(e.target.value)}
            placeholder="Enter your assignment text here..."
            className="form-input h-32 resize-none"
          />
        </div>

        <div>
          <label className="form-label">File Upload</label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${
                isDragActive
                  ? "border-primary-500 bg-blue-50"
                  : "border-gray-300 hover:border-primary-400"
              }`}>
            <input {...getInputProps()} />
            <div className="space-y-2">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48">
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="text-sm text-gray-600">
                {isDragActive ? (
                  <p>Drop files here...</p>
                ) : (
                  <p>Drag & drop files here, or click to select</p>
                )}
              </div>
              <p className="text-xs text-gray-500">
                PDF, DOC, DOCX, TXT up to 10MB
              </p>
            </div>
          </div>
        </div>

        {files.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Selected Files:
            </h4>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <button
                    onClick={() =>
                      setFiles(files.filter((_, i) => i !== index))
                    }
                    className="text-red-600 hover:text-red-800 text-sm">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={uploading || (!textSubmission && files.length === 0)}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
          {uploading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </span>
          ) : (
            "Submit Assignment"
          )}
        </button>
      </div>
    </div>
  );
}
