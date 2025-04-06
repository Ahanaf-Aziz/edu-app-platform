
import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { VoiceButton } from "@/components/ui/voice-button";
import { MessageBubble } from "@/components/ui/message-bubble";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Send, Mic, MessageSquare, VolumeX, Volume2, AlignLeft, Key } from "lucide-react";
import PageTransition from "@/components/layout/PageTransition";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { speakWithGoogleTTS } from "@/utils/googleTTS";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(true);
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
    
    // Check for API key in localStorage
    const savedApiKey = localStorage.getItem('geminiApiKey');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setShowApiKeyInput(false);
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

  const askGemini = async (prompt: string) => {
    if (!apiKey) {
      toast.error("Please provide your Gemini API key first");
      setShowApiKeyInput(true);
      return "I need a valid Gemini API key to provide responses.";
    }

    try {
      // Initialize Gemini AI with the API key
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Get the generative model
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      // Prepare the chat prompt
      const generationConfig = {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      };
      
      // Create education-focused system prompt
      const educationPrompt = "You are EduBot, an educational assistant powered by Google's Gemini AI. " +
        "You specialize in providing educational answers, explanations, and support for students and teachers. " +
        "Keep answers clear, accurate, and age-appropriate. " +
        "When possible, structure your responses with clear headings and bullet points for better understanding. " +
        "If you don't know something, say so rather than making up information.";
        
      // Create a new chat session
      const chat = model.startChat({
        generationConfig,
        history: [
          {
            role: "user",
            parts: [{ text: "Please introduce yourself as EduBot" }],
          },
          {
            role: "model",
            parts: [{ text: "Hello! I'm EduBot, your educational assistant powered by Google's Gemini AI. I'm here to help students and teachers with educational questions, explanations, and support. How can I assist you with your learning today?" }],
          },
          {
            role: "user",
            parts: [{ text: educationPrompt }],
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

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!inputText.trim() && !isListening) return;
    
    // Check if API key is set
    if (!apiKey && showApiKeyInput) {
      toast.error("Please enter your Gemini API key first");
      return;
    }
    
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
      // Get response from Gemini AI
      const geminiResponse = await askGemini(userMessage.content);
      
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
        content: "I'm having trouble processing your request. Please try again later.",
        sender: "assistant",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
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
            
            {showApiKeyInput ? (
              <div className="p-6 space-y-4">
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
