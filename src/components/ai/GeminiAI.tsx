
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageBubble } from "@/components/ui/message-bubble";
import { Input } from "@/components/ui/input";
import { Bot, Send, Lightbulb, Brain, FileText } from "lucide-react";
import { toast } from "sonner";

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

  const handleSendMessage = () => {
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
      timestamp: new Date().toLocaleTimeString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    // In a real implementation, we would call the Gemini API here
    setTimeout(() => {
      let response = "";
      
      if (mode === "chat") {
        response = "I'm your AI teaching assistant powered by Gemini. I can help answer questions about your lessons, explain difficult concepts, or suggest teaching strategies.";
      } else if (mode === "generate") {
        response = "I've generated a new lesson plan based on your input. This includes learning objectives, activities, and assessment strategies tailored to your specific needs.";
      } else if (mode === "analyze") {
        response = "After analyzing the student submissions, I've identified common misconceptions in understanding photosynthesis. Many students struggle with the concept of light-dependent reactions.";
      }
      
      const assistantMessage = {
        content: response,
        sender: "assistant" as const,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
      setPrompt("");
    }, 1500);
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
    
    setShowApiKeyInput(false);
    toast.success("API key saved successfully");
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="space-y-1 pb-2">
        <div className="flex items-center space-x-2">
          {mode === "chat" && <Bot className="h-5 w-5 text-primary" />}
          {mode === "generate" && <Lightbulb className="h-5 w-5 text-primary" />}
          {mode === "analyze" && <Brain className="h-5 w-5 text-primary" />}
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-4 space-y-4 overflow-hidden">
        {showApiKeyInput ? (
          <div className="space-y-4">
            <div className="text-sm">
              <p>To use Gemini AI features, you need to provide your Google Gemini API key. This key will be stored locally in your browser.</p>
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Enter your Gemini API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <Button 
                onClick={handleSaveApiKey} 
                className="w-full"
              >
                Save API Key
              </Button>
            </div>
          </div>
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
            </div>

            <div className="pt-2 border-t">
              <div className="flex space-x-2">
                <Textarea
                  placeholder={placeholder}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 min-h-[60px] resize-none"
                />
                <Button 
                  size="icon"
                  disabled={isLoading || !prompt.trim()} 
                  onClick={handleSendMessage}
                  className="h-[60px] w-[60px] shrink-0"
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
