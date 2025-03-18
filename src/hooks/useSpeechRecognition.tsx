
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
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        // Set better properties for better performance
        recognition.maxAlternatives = 3; // Get multiple alternatives
        
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
            setTranscript(finalTranscript.trim());
          } else if (currentTranscript) {
            setTranscript(currentTranscript.trim());
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
          if (isListening) {
            try {
              recognition.start();
            } catch (e) {
              console.error('Error restarting recognition on end', e);
            }
          }
        };
        
        recognitionRef.current = recognition;
        setHasRecognitionSupport(true);
      } else {
        setHasRecognitionSupport(false);
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
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
        toast.info("Listening...", { duration: 1000 });
      } catch (error) {
        // Handle the case where recognition is already started
        console.log("Recognition already started:", error);
      }
    }
  }, []);

  // Handle stopping the speech recognition
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      
      if (retryTimeoutRef.current) {
        window.clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    }
  }, []);

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    hasRecognitionSupport,
  };
}
