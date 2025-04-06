
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageBubble } from "@/components/ui/message-bubble";
import { Input } from "@/components/ui/input";
import { Bot, Send, Lightbulb, Brain, FileText, Volume2, VolumeX, Key } from "lucide-react";
import { toast } from "sonner";
import { speakWithGoogleTTS } from "@/utils/googleTTS";
import { motion } from "framer-motion";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
  const [apiKey, setApiKey] = useState("");
  const [messages, setMessages] = useState<Array<{content: string, sender: "user" | "assistant", timestamp: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(true);
  const [isTTSEnabled, setIsTTSEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check for API key on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('geminiApiKey');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setShowApiKeyInput(false);
    }
  }, []);

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

  const askGemini = async (prompt: string) => {
    if (!apiKey) {
      toast.error("Please provide your Gemini API key first");
      setShowApiKeyInput(true);
      return "I need a valid Gemini API key to provide responses.";
    }

    try {
      // Initialize Gemini AI with the API key
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Get the generative model (using gemini-1.5-flash for faster responses)
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      // Prepare the chat prompt
      const generationConfig = {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      };
      
      // Create specific system prompt based on mode
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
        
      // Create a new chat session
      const chat = model.startChat({
        generationConfig,
        history: [
          {
            role: "user",
            parts: [{ text: "Please introduce yourself based on your role" }],
          },
          {
            role: "model",
            parts: [{ text: `Hello! I'm your Gemini AI assistant for ${mode === "chat" ? "teaching support" : mode === "generate" ? "content generation" : "student work analysis"}. How can I help you today?` }],
          },
          {
            role: "user",
            parts: [{ text: systemPrompt }],
          }
        ],
      });

      // Send the user prompt and get response
      const result = await chat.sendMessage(prompt);
      const response = result.response.text();
      return response;
    } catch (error) {
      console.error("Error calling Gemini AI:", error);
      return "I'm having trouble connecting to Gemini AI. Please check your API key or try again later.";
    }
  };

  const handleSendMessage = async () => {
    if (!prompt.trim()) return;
    
    // Check if API key is set
    if (!apiKey && showApiKeyInput) {
      toast.error("Please enter your Gemini API key first");
      return;
    }
    
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
      // Get response from Gemini AI
      const response = await askGemini(prompt);
      
      const assistantMessage = {
        content: response,
        sender: "assistant" as const,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error in Gemini request:", error);
      
      const errorMessage = {
        content: "I'm having trouble processing your request. Please check your API key or try again later.",
        sender: "assistant" as const,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, errorMessage]);
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

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast.error("Please enter a valid API key");
      return;
    }
    
    // Save API key to local storage
    localStorage.setItem('geminiApiKey', apiKey);
    setShowApiKeyInput(false);
    toast.success("API key saved successfully");
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
        {showApiKeyInput ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="text-sm bg-primary/5 p-4 rounded-lg border border-primary/10">
              <p className="font-medium text-primary mb-2">🔑 API Key Required</p>
              <p>To use Gemini AI features, you need to provide your Google Gemini API key. This key will be stored locally in your browser.</p>
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Enter your Gemini API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-background/70"
              />
              <Button 
                onClick={handleSaveApiKey} 
                className="w-full bg-primary hover:bg-primary/90"
              >
                <Key className="mr-2 h-4 w-4" />
                Save API Key
              </Button>
            </div>
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
