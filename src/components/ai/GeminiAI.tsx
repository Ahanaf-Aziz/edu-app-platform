
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageBubble } from "@/components/ui/message-bubble";
import { Input } from "@/components/ui/input";
import { Bot, Send, Lightbulb, Brain, FileText, Volume2, VolumeX, Info } from "lucide-react";
import { toast } from "sonner";
import { speakWithGoogleTTS } from "@/utils/googleTTS";
import { motion } from "framer-motion";
import { askGeminiSecure } from "@/utils/apiService";

interface GeminiAIProps {
  mode?: "chat" | "generate" | "analyze";
  placeholder?: string;
  title?: string;
  description?: string;
}

export function GeminiAI({ 
  mode = "chat", 
  placeholder = "Ask Gemini anything...",
  title = "Gemini AI Assistant",
  description = "Powered by Google's Gemini AI model"
}: GeminiAIProps) {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Array<{content: string, sender: "user" | "assistant", timestamp: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTTSEnabled, setIsTTSEnabled] = useState(true);
  const [isBackendAvailable, setIsBackendAvailable] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const handleSendMessage = async () => {
    if (!prompt.trim()) return;
    
    // Add user message
    const userMessage = {
      content: prompt,
      sender: "user" as const,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setPrompt("");
    
    try {
      // Create system prompt based on mode
      let systemPrompt = "";
      
      if (mode === "chat") {
        systemPrompt = "You are a Gemini Teaching Assistant, specialized in helping teachers with educational questions, " +
          "subject matter expertise, and classroom management. Give thoughtful, accurate, and helpful responses.";
      } else if (mode === "generate") {
        systemPrompt = "You are a Gemini Content Generator, specialized in creating educational content like lesson plans, " +
          "worksheets, quizzes, and activities. Structure your content clearly with headers and sections.";
      } else if (mode === "analyze") {
        systemPrompt = "You are a Gemini Student Work Analyzer, specialized in reviewing student submissions, " +
          "identifying patterns, misconceptions, and providing constructive feedback for improvement.";
      }
      
      // Get response from secure backend API
      const response = await askGeminiSecure(prompt, mode, systemPrompt);
      
      const assistantMessage = {
        content: response,
        sender: "assistant" as const,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error in Gemini request:", error);
      
      const errorMessage = {
        content: "I'm having trouble processing your request. Our system might be experiencing issues.",
        sender: "assistant" as const,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsBackendAvailable(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleTTS = () => {
    setIsTTSEnabled(prev => !prev);
    toast.success(`Text-to-speech ${!isTTSEnabled ? 'enabled' : 'disabled'}`);
    
    // Stop any ongoing speech when disabling
    if (isTTSEnabled) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <Card className="h-full flex flex-col shadow-lg bg-card/80 backdrop-blur-sm border rounded-xl overflow-hidden">
      <CardHeader className="space-y-1 pb-2 border-b bg-background/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {mode === "chat" && <Bot className="h-5 w-5 text-primary" />}
            {mode === "generate" && <Lightbulb className="h-5 w-5 text-primary" />}
            {mode === "analyze" && <Brain className="h-5 w-5 text-primary" />}
            <CardTitle className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">{title}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTTS}
            title={isTTSEnabled ? "Disable text-to-speech" : "Enable text-to-speech"}
            className="h-8 w-8"
          >
            {isTTSEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-4 space-y-4 overflow-hidden">
        {!isBackendAvailable ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="text-sm bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/20">
              <p className="font-medium text-yellow-600 mb-2">⚠️ Backend Connection Issue</p>
              <p>We're having trouble connecting to our AI backend services. The AI functionality may be limited until this is resolved.</p>
            </div>
            <Button 
              onClick={() => setIsBackendAvailable(true)} 
              variant="outline"
              className="w-full"
            >
              <Info className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </motion.div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-2 min-h-[200px]">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-4 text-muted-foreground">
                  {mode === "chat" && (
                    <>
                      <Bot className="h-12 w-12 mb-2 opacity-50" />
                      <div className="space-y-2">
                        <h3 className="font-medium">Gemini Teaching Assistant</h3>
                        <p className="text-sm">Ask questions about teaching strategies, lesson plans, or subject matter.</p>
                      </div>
                    </>
                  )}
                  {mode === "generate" && (
                    <>
                      <FileText className="h-12 w-12 mb-2 opacity-50" />
                      <div className="space-y-2">
                        <h3 className="font-medium">Generate Lesson Content</h3>
                        <p className="text-sm">Describe your learning objectives, and I'll help create lesson plans, activities, or assessments.</p>
                      </div>
                    </>
                  )}
                  {mode === "analyze" && (
                    <>
                      <Brain className="h-12 w-12 mb-2 opacity-50" />
                      <div className="space-y-2">
                        <h3 className="font-medium">Student Work Analysis</h3>
                        <p className="text-sm">Describe student submissions or challenges, and I'll provide analysis and insights.</p>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                messages.map((message, i) => (
                  <MessageBubble
                    key={i}
                    content={message.content}
                    sender={message.sender}
                    timestamp={message.timestamp}
                  />
                ))
              )}
              {isLoading && (
                <MessageBubble
                  content=""
                  sender="assistant"
                  isLoading={true}
                />
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="pt-2 border-t">
              <div className="flex space-x-2">
                <Textarea
                  placeholder={placeholder}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 min-h-[80px] resize-none bg-background/70 backdrop-blur-sm"
                />
                <Button 
                  size="icon"
                  disabled={isLoading || !prompt.trim()} 
                  onClick={handleSendMessage}
                  className="h-[80px] w-[50px] bg-primary hover:bg-primary/90"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
