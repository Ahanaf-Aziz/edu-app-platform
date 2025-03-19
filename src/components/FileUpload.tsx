
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Upload, X, Mic, MicOff, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface FileMetadata {
  title?: string;
  description?: string;
  dueDate?: Date;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
}

interface FileUploadProps {
  onFileUpload: (file: File, metadata: FileMetadata) => void;
  onVoiceInput?: (text: string) => void;
  label?: string;
  allowedTypes?: string;
  showVoiceInput?: boolean;
  showMetadataForm?: boolean;
  metadataType?: "assignment" | "peer";
}

const FileUpload = ({ 
  onFileUpload, 
  onVoiceInput, 
  label = "Upload Document", 
  allowedTypes = ".pdf,.doc,.docx", 
  showVoiceInput = false,
  showMetadataForm = false,
  metadataType = "assignment"
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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  
  // Update voice text when transcript changes while listening
  useEffect(() => {
    if (isListening && transcript) {
      setVoiceText(transcript);
    }
  }, [transcript, isListening]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      
      // Auto-populate title from filename if empty
      if (!title) {
        const fileName = e.target.files[0].name;
        // Remove file extension
        const titleFromFile = fileName.split('.').slice(0, -1).join('.');
        setTitle(titleFromFile);
      }
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }
    
    if (showMetadataForm && !title.trim()) {
      toast.error("Please provide a title for your document");
      return;
    }
    
    // Create metadata object
    const metadata: FileMetadata = {
      title: title.trim() || selectedFile.name,
      description: description.trim() || undefined,
      dueDate: metadataType === "assignment" ? dueDate : undefined,
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      fileType: selectedFile.type,
      uploadedAt: new Date().toISOString(),
    };
    
    onFileUpload(selectedFile, metadata);
    toast.success(`File "${selectedFile.name}" uploaded successfully`);
    
    // Reset form
    setSelectedFile(null);
    setTitle("");
    setDescription("");
    setDueDate(undefined);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setTitle("");
    setDescription("");
    setDueDate(undefined);
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
    <div className="space-y-4">
      {showMetadataForm && (
        <div className="space-y-4 p-4 border rounded-md bg-muted/20">
          <div className="space-y-2">
            <Label htmlFor="document-title">Title</Label>
            <Input 
              id="document-title" 
              placeholder={metadataType === "assignment" ? "Assignment Title" : "Document Title"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="document-description">Description</Label>
            <Textarea 
              id="document-description" 
              placeholder={metadataType === "assignment" ? "Describe the assignment requirements" : "Description of your work"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          
          {metadataType === "assignment" && (
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : <span>Select a due date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
      )}

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
