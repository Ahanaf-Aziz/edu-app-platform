
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Upload, X, Mic, MicOff } from "lucide-react";
import { toast } from "sonner";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  onVoiceInput?: (text: string) => void;
  label?: string;
  allowedTypes?: string;
  showVoiceInput?: boolean;
}

const FileUpload = ({ 
  onFileUpload, 
  onVoiceInput, 
  label = "Upload Document", 
  allowedTypes = ".pdf,.doc,.docx", 
  showVoiceInput = false 
}: FileUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { 
    transcript, 
    isListening, 
    startListening, 
    stopListening, 
    resetTranscript,
    hasRecognitionSupport 
  } = useSpeechRecognition();
  
  const [voiceText, setVoiceText] = useState("");
  
  // Update voice text when transcript changes while listening
  useEffect(() => {
    if (isListening && transcript) {
      setVoiceText(transcript);
    }
  }, [transcript, isListening]);

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

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
      // Transcript is already set via the useEffect
    } else {
      resetTranscript();
      setVoiceText("");
      startListening();
    }
  };

  const handleSubmitVoiceText = () => {
    if (voiceText.trim() && onVoiceInput) {
      onVoiceInput(voiceText);
      toast.success("Voice input saved successfully");
      setVoiceText("");
      resetTranscript();
    } else {
      toast.error("No voice input to save");
    }
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

      {showVoiceInput && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Voice Input</span>
            {hasRecognitionSupport ? (
              <Button 
                size="sm" 
                variant={isListening ? "destructive" : "outline"}
                onClick={handleVoiceToggle}
              >
                {isListening ? (
                  <>
                    <MicOff className="h-4 w-4 mr-1" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-1" />
                    Start Recording
                  </>
                )}
              </Button>
            ) : (
              <Button 
                size="sm" 
                variant="outline" 
                disabled 
                title="Speech recognition not supported in your browser"
              >
                <Mic className="h-4 w-4 mr-1" />
                Not Supported
              </Button>
            )}
          </div>
          
          {(isListening || voiceText) && (
            <div className="p-3 border rounded-md bg-muted/20">
              <p className="text-sm mb-2">
                {isListening ? "Recording..." : "Recorded text:"}
              </p>
              <p className="text-sm italic">
                {isListening ? transcript || "Listening..." : voiceText || "No voice input detected"}
              </p>
              
              {!isListening && voiceText && (
                <div className="mt-2 flex justify-end">
                  <Button size="sm" onClick={handleSubmitVoiceText}>
                    Submit Voice Input
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
