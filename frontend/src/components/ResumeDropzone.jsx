import React, { useCallback, useState } from "react";
import { Upload, FileText, X } from "lucide-react";

export const ResumeDropzone = ({ onFileSelect, error }) => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const handleChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const processFile = (file) => {
    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }
    setFile(file);
    onFileSelect(file);
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setFile(null);
    onFileSelect(null);
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById("fileInput").click()}
        className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-3 ${
          isDragging ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
        } ${error ? "border-error bg-error/5" : ""}`}
      >
        <input
          id="fileInput"
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleChange}
        />

        {!file ? (
          <>
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
              <Upload size={24} />
            </div>
            <div className="text-center">
              <p className="text-white font-medium">Click to upload or drag and drop</p>
              <p className="text-text-secondary text-sm">PDF (MAX. 5MB)</p>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-4 bg-secondary p-4 rounded-xl border border-border w-full">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
              <FileText size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{file.name}</p>
              <p className="text-xs text-text-secondary">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={removeFile}
              className="p-1 hover:bg-white/10 rounded-full transition-colors text-text-secondary hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-error mt-1 ml-1">{error}</p>}
    </div>
  );
};
