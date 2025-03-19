
import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [hasRecognitionSupport, setHasRecognitionSupport] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const retryTimeoutRef = useRef<number | null>(null);
  const maxRetries = 3;
  const [retryCount, setRetryCount] = useState(0);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if the browser supports the Web Speech API
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognitionAPI) {
        try {
          const recognition = new SpeechRecognitionAPI();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';
          
          recognition.onresult = (event) => {
            let currentTranscript = '';
            let finalTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
              const transcript = event.results[i][0].transcript;
              
              if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
              } else {
                currentTranscript += transcript;
              }
            }
            
            if (finalTranscript) {
              setTranscript(prev => prev + finalTranscript);
              console.log("Final transcript:", finalTranscript);
            } else if (currentTranscript) {
              setTranscript(prev => currentTranscript);
              console.log("Current transcript:", currentTranscript);
            }
            
            // Reset retry count on successful recognition
            if (finalTranscript || currentTranscript) {
              setRetryCount(0);
            }
          };
          
          recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            
            if (event.error === 'not-allowed') {
              toast.error('Microphone access denied. Please allow microphone access to use voice input.');
              setIsListening(false);
            } else if (event.error === 'network') {
              // For network errors, we'll try to restart recognition
              if (retryCount < maxRetries) {
                const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
                console.log(`Network error, retrying in ${delay}ms. Attempt ${retryCount + 1}/${maxRetries}`);
                
                if (retryTimeoutRef.current) {
                  window.clearTimeout(retryTimeoutRef.current);
                }
                
                retryTimeoutRef.current = window.setTimeout(() => {
                  if (isListening) {
                    try {
                      recognition.stop();
                      setTimeout(() => {
                        recognition.start();
                        setRetryCount(prev => prev + 1);
                      }, 100);
                    } catch (e) {
                      console.error('Error restarting recognition', e);
                    }
                  }
                }, delay);
              } else {
                toast.error('Speech recognition network error. Please check your internet connection and try again.');
                setIsListening(false);
              }
            } else {
              toast.error(`Speech recognition error: ${event.error}`);
              setIsListening(false);
            }
          };
          
          recognition.onend = () => {
            console.log("Recognition ended, isListening:", isListening);
            if (isListening) {
              try {
                recognition.start();
                console.log("Restarted recognition");
              } catch (e) {
                console.error('Error restarting recognition on end', e);
                setIsListening(false);
              }
            }
          };
          
          recognitionRef.current = recognition;
          setHasRecognitionSupport(true);
          console.log("Speech recognition initialized successfully");
        } catch (error) {
          console.error("Error initializing speech recognition:", error);
          setHasRecognitionSupport(false);
          toast.error("Failed to initialize speech recognition");
        }
      } else {
        console.warn("Speech Recognition API not supported in this browser");
        setHasRecognitionSupport(false);
        toast.error("Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.");
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          console.log("Recognition stopped on cleanup");
        } catch (error) {
          console.error("Error stopping recognition on cleanup:", error);
        }
      }
      
      if (retryTimeoutRef.current) {
        window.clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Handle starting the speech recognition
  const startListening = useCallback(() => {
    setTranscript('');
    setRetryCount(0);
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        console.log("Speech recognition started");
        toast.info("Listening...", { duration: 1000 });
      } catch (error) {
        // Handle the case where recognition is already started
        console.error("Recognition already started or error:", error);
        
        // Try to restart recognition
        try {
          recognitionRef.current.stop();
          setTimeout(() => {
            if (recognitionRef.current) {
              recognitionRef.current.start();
              setIsListening(true);
              console.log("Speech recognition restarted after error");
            }
          }, 100);
        } catch (restartError) {
          console.error("Failed to restart recognition:", restartError);
          toast.error("Failed to start voice recognition. Please try again.");
        }
      }
    } else {
      console.error("Speech recognition not initialized");
      toast.error("Speech recognition not available. Please try a different browser.");
    }
  }, []);

  // Handle stopping the speech recognition
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        console.log("Speech recognition stopped");
        setIsListening(false);
        
        if (retryTimeoutRef.current) {
          window.clearTimeout(retryTimeoutRef.current);
          retryTimeoutRef.current = null;
        }
      } catch (error) {
        console.error("Error stopping recognition:", error);
      }
    }
  }, []);

  // Reset transcript
  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    hasRecognitionSupport,
  };
}
