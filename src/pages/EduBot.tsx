
import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { VoiceButton } from "@/components/ui/voice-button";
import { MessageBubble } from "@/components/ui/message-bubble";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Mic, MessageSquare } from "lucide-react";
import PageTransition from "@/components/layout/PageTransition";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: string;
}

const EduBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hi there! I'm EduBot. Ask me any question or submit an answer for instant feedback.",
      sender: "assistant",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Speech recognition setup
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [transcript, setTranscript] = useState("");

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
        
        recognition.onresult = (event) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              currentTranscript += transcript;
            }
          }
          
          if (currentTranscript) {
            setTranscript(currentTranscript);
            setInputText(currentTranscript);
          }
        };
        
        recognition.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          if (event.error === 'not-allowed') {
            toast.error('Microphone access denied. Please allow microphone access to use voice input.');
          } else {
            toast.error(`Speech recognition error: ${event.error}`);
          }
          setIsListening(false);
        };
        
        recognition.onend = () => {
          if (isListening) {
            recognition.start();
          }
        };
        
        recognitionRef.current = recognition;
      } else {
        toast.error('Your browser does not support speech recognition. Please try using Chrome or Edge.');
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Handle starting and stopping the speech recognition
  useEffect(() => {
    const recognition = recognitionRef.current;
    
    if (recognition) {
      if (isListening) {
        try {
          recognition.start();
          toast.info("Listening...", { duration: 1000 });
        } catch (error) {
          // Handling the case where recognition is already started
          console.log("Recognition already started:", error);
        }
      } else if (!isProcessing) {
        recognition.stop();
        setTranscript("");
      }
    }
  }, [isListening, isProcessing]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!inputText.trim() && !isListening) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputText.trim(),
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);
    
    // Simulate AI processing time
    setTimeout(() => {
      let responseContent = "";
      
      // Simple response logic based on input
      if (inputText.toLowerCase().includes("hello") || inputText.toLowerCase().includes("hi")) {
        responseContent = "Hello! How can I help with your studies today?";
      } else if (inputText.toLowerCase().includes("math") || inputText.toLowerCase().includes("equation")) {
        responseContent = "For math problems, try to break them down step by step. What specific equation or concept are you working with?";
      } else if (inputText.toLowerCase().includes("feedback")) {
        responseContent = "I'd be happy to give you feedback! Please share your answer or question, and I'll analyze it for you.";
      } else if (inputText.toLowerCase().includes("history")) {
        responseContent = "When studying history, focus on understanding the context and causality of events rather than just memorizing dates. What period are you studying?";
      } else {
        responseContent = "Thank you for your input. When answering this type of question, consider addressing the key concepts and providing specific examples to support your points. Also, try to structure your response with a clear introduction and conclusion.";
      }
      
      // Add AI response
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        sender: "assistant",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const startListening = () => {
    setIsListening(true);
  };

  const stopListening = () => {
    setIsListening(false);
    setIsProcessing(true);
    
    // Submit the transcript after stopping
    setTimeout(() => {
      setIsProcessing(false);
      if (transcript.trim()) {
        handleSubmit();
      }
    }, 500);
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold mb-3">EduBot</h1>
          <p className="text-muted-foreground">
            Get instant feedback on your answers and questions using voice or text
          </p>
        </motion.div>

        <Card className="border shadow-subtle bg-card/50 backdrop-blur-sm overflow-hidden">
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-none border-b bg-background/50 backdrop-blur-sm">
              <TabsTrigger value="chat" className="data-[state=active]:bg-background">
                <MessageSquare className="h-4 w-4 mr-2" />
                <span>Chat</span>
              </TabsTrigger>
              <TabsTrigger value="voice" className="data-[state=active]:bg-background">
                <Mic className="h-4 w-4 mr-2" />
                <span>Voice</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="p-0">
              <div className="h-[500px] flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      content={message.content}
                      sender={message.sender}
                      timestamp={message.timestamp}
                    />
                  ))}
                  {isLoading && (
                    <MessageBubble
                      content=""
                      sender="assistant"
                      isLoading={true}
                    />
                  )}
                </div>
                
                <form 
                  onSubmit={handleSubmit}
                  className="border-t p-4 bg-background/50 backdrop-blur-sm"
                >
                  <div className="flex space-x-2">
                    <Textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Type your question or answer here..."
                      className="resize-none"
                      maxLength={500}
                    />
                    <Button type="submit" className="shrink-0">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </div>
            </TabsContent>
            
            <TabsContent value="voice" className="p-0">
              <div className="h-[500px] flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      content={message.content}
                      sender={message.sender}
                      timestamp={message.timestamp}
                    />
                  ))}
                  {isLoading && (
                    <MessageBubble
                      content=""
                      sender="assistant"
                      isLoading={true}
                    />
                  )}
                </div>
                
                {isListening && (
                  <div className="px-4 py-2 bg-primary/10 border-t border-primary/20 text-center text-sm">
                    <p>{transcript || "Listening..."}</p>
                  </div>
                )}
                
                <div className="border-t p-6 bg-background/50 backdrop-blur-sm flex justify-center">
                  <VoiceButton
                    onStart={startListening}
                    onStop={stopListening}
                    isListening={isListening}
                    isProcessing={isProcessing}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </PageTransition>
  );
};

export default EduBot;
