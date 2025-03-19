
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface VoiceButtonProps {
  onStart: () => void;
  onStop: () => void;
  isListening?: boolean;
  isProcessing?: boolean;
  className?: string;
  disabled?: boolean;
}

export function VoiceButton({
  onStart,
  onStop,
  isListening = false,
  isProcessing = false,
  className,
  disabled = false,
}: VoiceButtonProps) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  
  // Check browser compatibility at the component level
  const [isSupportedBrowser, setIsSupportedBrowser] = useState(true);
  
  useEffect(() => {
    // Check if the browser supports the Web Speech API
    if (typeof window !== 'undefined') {
      const hasSpeechRecognition = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
      setIsSupportedBrowser(hasSpeechRecognition);
      
      if (!hasSpeechRecognition) {
        console.warn("Speech Recognition not supported in this browser");
      }
    }
  }, []);
  
  const handleClick = () => {
    if (!isSupportedBrowser) {
      toast.error("Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.");
      return;
    }
    
    if (disabled) return;
    
    if (isListening) {
      onStop();
    } else {
      try {
        onStart();
      } catch (error) {
        console.error("Error starting voice recording:", error);
        toast.error("Failed to start recording. Please try again.");
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = {
      id: Date.now(),
      x,
      y,
    };
    
    setRipples((prev) => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== newRipple.id));
    }, 600);
  };

  const isButtonDisabled = disabled || !isSupportedBrowser;

  return (
    <div className={cn("relative", className)}>
      <Button
        type="button"
        variant={isListening ? "destructive" : "default"}
        size="lg"
        className={cn(
          "relative overflow-hidden transition-all duration-300 ease-in-out",
          isListening ? "animate-pulse" : "",
          className
        )}
        disabled={isButtonDisabled || isProcessing}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        title={!isSupportedBrowser ? "Speech recognition not supported in your browser" : ""}
      >
        <div className="flex items-center space-x-2">
          {isProcessing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : isListening ? (
            <MicOff className="h-5 w-5" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
          <span>
            {isProcessing 
              ? "Processing" 
              : isListening 
                ? "Stop Recording" 
                : !isSupportedBrowser 
                  ? "Not Supported" 
                  : "Start Recording"}
          </span>
        </div>
        
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute block bg-white/20 rounded-full animate-ripple"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: '250px',
              height: '250px',
              marginLeft: '-125px',
              marginTop: '-125px',
              transform: 'scale(0)',
            }}
          />
        ))}
      </Button>
      
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 -z-10 rounded-full animate-pulse bg-destructive/20"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
