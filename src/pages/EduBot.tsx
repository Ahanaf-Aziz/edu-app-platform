import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { VoiceButton } from "@/components/ui/voice-button";
import { MessageBubble } from "@/components/ui/message-bubble";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Mic, MessageSquare, VolumeX, Volume2, Info } from "lucide-react";
import PageTransition from "@/components/layout/PageTransition";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { speakWithGoogleTTS } from "@/utils/googleTTS";
import { askGeminiSecure } from "@/utils/apiService";

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
      content: "Hi there! I'm EduBot powered by Google's Gemini AI. Ask me any question for instant answers and educational support.",
      sender: "assistant",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTTSEnabled, setIsTTSEnabled] = useState(true);
  const [isBackendAvailable, setIsBackendAvailable] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentTab, setCurrentTab] = useState("chat");
  
  // Use our custom speech recognition hook
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    hasRecognitionSupport
  } = useSpeechRecognition();

  // Update input text when transcript changes
  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
    }
  }, [transcript]);
  
  // Check browser support on component mount
  useEffect(() => {
    if (!hasRecognitionSupport) {
      toast.error('Your browser does not support speech recognition. Please try using Chrome or Edge.');
    }
  }, [hasRecognitionSupport]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    
    // Speak the last assistant message if TTS is enabled
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.sender === "assistant" && isTTSEnabled) {
      speakWithGoogleTTS({
        text: lastMessage.content,
        voice: 'neutral',
        language: 'en-US'
      });
    }
  }, [messages, isTTSEnabled]);

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
    
    try {
      // Create education-focused system prompt
      const educationPrompt = "You are EduBot, an educational assistant powered by Google's Gemini AI. " +
        "You specialize in providing educational answers, explanations, and support for students and teachers. " +
        "Keep answers clear, accurate, and age-appropriate. " +
        "When possible, structure your responses with clear headings and bullet points for better understanding. " +
        "If you don't know something, say so rather than making up information.";
      
      // Get response from secure backend
      const geminiResponse = await askGeminiSecure(userMessage.content, "chat", educationPrompt);
      
      // Add AI response
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: geminiResponse,
        sender: "assistant",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error in chat submission:", error);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble processing your request. Our system might be experiencing issues.",
        sender: "assistant",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
      setIsBackendAvailable(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceStart = () => {
    startListening();
  };

  const handleVoiceStop = () => {
    stopListening();
    setIsProcessing(true);
    
    // Submit the transcript after stopping
    setTimeout(() => {
      setIsProcessing(false);
      if (transcript.trim()) {
        handleSubmit();
      }
    }, 500);
  };

  const toggleTTS = () => {
    setIsTTSEnabled(prev => !prev);
    toast.success(`Text-to-speech ${!isTTSEnabled ? 'enabled' : 'disabled'}`);
    
    // Stop any ongoing speech when disabling
    if (isTTSEnabled) {
      window.speechSynthesis.cancel();
    }
  };

  const handleRetryConnection = () => {
    setIsBackendAvailable(true);
    toast.info("Attempting to reconnect to AI services...");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
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
          <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">EduBot</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Get instant AI-powered answers to your educational questions using voice or text with Gemini AI technology
          </p>
        </motion.div>

        <Card className="border shadow-lg bg-card/80 backdrop-blur-sm overflow-hidden rounded-xl">
          <Tabs defaultValue="chat" className="w-full" onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-2 rounded-none border-b bg-card/50 backdrop-blur-sm">
              <TabsTrigger value="chat" className="data-[state=active]:bg-background/80 transition-all duration-200">
                <MessageSquare className="h-4 w-4 mr-2" />
                <span>Chat</span>
              </TabsTrigger>
              <TabsTrigger value="voice" className="data-[state=active]:bg-background/80 transition-all duration-200">
                <Mic className="h-4 w-4 mr-2" />
                <span>Voice</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="absolute right-4 top-2 z-10">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTTS}
                title={isTTSEnabled ? "Disable text-to-speech" : "Enable text-to-speech"}
              >
                {isTTSEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
            </div>
            
            {!isBackendAvailable ? (
              <div className="p-6 space-y-4">
                <div className="text-sm bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/20">
                  <p className="font-medium text-yellow-600 mb-2">⚠️ Backend Connection Issue</p>
                  <p>We're having trouble connecting to our AI backend services. The AI functionality may be limited until this is resolved.</p>
                </div>
                <Button onClick={handleRetryConnection} variant="default" className="w-full">
                  <Info className="mr-2 h-4 w-4" />
                  Retry Connection
                </Button>
              </div>
            ) : (
              <>
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
                      <div ref={messagesEndRef} />
                    </div>
                    
                    <form 
                      onSubmit={handleSubmit}
                      className="border-t p-4 bg-background/50 backdrop-blur-sm"
                    >
                      <div className="flex space-x-2">
                        <Textarea
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Ask your educational questions..."
                          className="resize-none min-h-[80px] bg-background/70 backdrop-blur-sm"
                          maxLength={500}
                        />
                        <Button 
                          type="submit" 
                          className="shrink-0 h-[80px] w-[50px] bg-primary hover:bg-primary/90"
                          disabled={!inputText.trim() || isLoading}
                        >
                          <Send className="h-5 w-5" />
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
                      <div ref={messagesEndRef} />
                    </div>
                    
                    {isListening && (
                      <div className="px-4 py-3 bg-primary/10 border-t border-primary/20 text-center">
                        <p className="font-medium text-primary">{transcript || "Listening..."}</p>
                        <div className="flex justify-center mt-2 space-x-1">
                          <span className="inline-block w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                          <span className="inline-block w-2 h-2 bg-primary rounded-full animate-pulse delay-150"></span>
                          <span className="inline-block w-2 h-2 bg-primary rounded-full animate-pulse delay-300"></span>
                        </div>
                      </div>
                    )}
                    
                    <div className="border-t p-6 bg-background/50 backdrop-blur-sm flex flex-col items-center">
                      <VoiceButton
                        onStart={handleVoiceStart}
                        onStop={handleVoiceStop}
                        isListening={isListening}
                        isProcessing={isProcessing}
                        className="mb-3"
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        {hasRecognitionSupport 
                          ? "Ask your question by voice for instant Gemini AI answers" 
                          : "Speech recognition not supported in your browser"}
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </>
            )}
          </Tabs>
        </Card>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Card className="bg-card/80 backdrop-blur-sm p-4 shadow-subtle hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-primary mb-2">Gemini AI Powered</h3>
            <p className="text-sm text-muted-foreground">Get accurate and educational answers powered by Google's advanced Gemini AI technology.</p>
          </Card>
          
          <Card className="bg-card/80 backdrop-blur-sm p-4 shadow-subtle hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-primary mb-2">Voice Interaction</h3>
            <p className="text-sm text-muted-foreground">Speak your questions naturally and get spoken responses for an interactive learning experience.</p>
          </Card>
          
          <Card className="bg-card/80 backdrop-blur-sm p-4 shadow-subtle hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-primary mb-2">Educational Focus</h3>
            <p className="text-sm text-muted-foreground">Designed specifically for students and teachers with educational content prioritized in responses.</p>
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default EduBot;
