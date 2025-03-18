
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Upload, X } from "lucide-react";
import { toast } from "sonner";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  label?: string;
  allowedTypes?: string;
}

const FileUpload = ({ onFileUpload, label = "Upload Document", allowedTypes = ".pdf,.doc,.docx" }: FileUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onFileUpload(selectedFile);
      toast.success(`File "${selectedFile.name}" uploaded successfully`);
      setSelectedFile(null);
    } else {
      toast.error("Please select a file first");
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Input
          type="file"
          onChange={handleFileChange}
          accept={allowedTypes}
          className="flex-1"
          id="file-upload"
        />
        {selectedFile && (
          <Button variant="ghost" size="icon" onClick={clearSelection} aria-label="Clear selection">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {selectedFile && (
        <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-sm truncate max-w-[200px]">{selectedFile.name}</span>
          </div>
          <Button size="sm" onClick={handleUpload} className="ml-auto">
            <Upload className="h-4 w-4 mr-1" />
            Upload
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
