
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageTransition from "@/components/layout/PageTransition";
import { motion } from "framer-motion";
import { GeminiAI } from "@/components/ai/GeminiAI";
import { Bot, FileText, Brain, Sparkles, Book, School, PenLine, UserCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { speakWithGoogleTTS } from "@/utils/googleTTS";
import { toast } from "sonner";

const GeminiTools = () => {
  const [activeTab, setActiveTab] = useState("chat");
  
  useEffect(() => {
    // Check if API key exists in localStorage
    const hasApiKey = localStorage.getItem('geminiApiKey') !== null;
    
    // If we have saved the API key, show a welcome message
    if (hasApiKey) {
      toast.success("Gemini API key detected. Ready to use Gemini AI tools.");
    }
  }, []);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Announce tab change with TTS for accessibility
    speakWithGoogleTTS({
      text: `${value === "chat" ? "Teaching Assistant" : value === "generate" ? "Content Generator" : "Student Work Analysis"} tab selected`,
      voice: "neutral",
      speed: 1.2,
    });
  };

  const handleFeatureCardClick = (tabValue: string) => {
    setActiveTab(tabValue);
    
    const tabsElement = document.getElementById("gemini-tabs");
    if (tabsElement) {
      tabsElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const demoToolFeature = () => {
    toast.success("Feature guide started! Listen for instructions.");
    speakWithGoogleTTS({
      text: "Welcome to Gemini AI Tools. These advanced features can help you create lesson plans, analyze student work, and get teaching assistance powered by Google's Gemini AI.",
      voice: "neutral",
      speed: 1.0,
    });
  };

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center justify-center mb-3 p-2 rounded-full bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary mr-2" />
            <span className="font-medium text-primary">AI-Powered Educational Tools</span>
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Gemini AI Tools for Education</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Leverage Google's advanced Gemini AI technology to enhance teaching experiences and create engaging learning materials
          </p>
          <Button 
            variant="outline" 
            onClick={demoToolFeature}
            className="mt-4"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Discover What Gemini Can Do
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            onClick={() => handleFeatureCardClick("chat")}
            className="cursor-pointer"
          >
            <Card className={`bg-gradient-to-br ${activeTab === "chat" ? "from-primary/20 to-blue-500/20 border-primary" : "from-primary/5 to-blue-500/5 border-primary/10"} p-6 border h-full transition-all duration-300 hover:shadow-md`}>
              <Bot className="h-10 w-10 mb-3 text-primary" />
              <h3 className="text-lg font-medium mb-2">Teaching Assistant</h3>
              <p className="text-sm text-muted-foreground">
                Get instant answers to your educational questions, teaching strategies, and classroom management.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Lesson Planning</span>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Subject Expertise</span>
              </div>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            onClick={() => handleFeatureCardClick("generate")}
            className="cursor-pointer"
          >
            <Card className={`bg-gradient-to-br ${activeTab === "generate" ? "from-primary/20 to-blue-500/20 border-primary" : "from-primary/5 to-blue-500/5 border-primary/10"} p-6 border h-full transition-all duration-300 hover:shadow-md`}>
              <FileText className="h-10 w-10 mb-3 text-primary" />
              <h3 className="text-lg font-medium mb-2">Content Generator</h3>
              <p className="text-sm text-muted-foreground">
                Create personalized lesson plans, assignments, quizzes, and educational materials tailored to your curriculum.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Worksheets</span>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Quizzes</span>
              </div>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            onClick={() => handleFeatureCardClick("analyze")}
            className="cursor-pointer"
          >
            <Card className={`bg-gradient-to-br ${activeTab === "analyze" ? "from-primary/20 to-blue-500/20 border-primary" : "from-primary/5 to-blue-500/5 border-primary/10"} p-6 border h-full transition-all duration-300 hover:shadow-md`}>
              <Brain className="h-10 w-10 mb-3 text-primary" />
              <h3 className="text-lg font-medium mb-2">Student Work Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Analyze student submissions to identify patterns, misconceptions, and provide targeted feedback.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Insights</span>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Grading</span>
              </div>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="cursor-pointer"
          >
            <Card className="bg-gradient-to-br from-primary/5 to-blue-500/5 p-6 border border-primary/10 h-full transition-all duration-300 hover:shadow-md">
              <School className="h-10 w-10 mb-3 text-primary" />
              <h3 className="text-lg font-medium mb-2">Classroom Integration</h3>
              <p className="text-sm text-muted-foreground">
                Seamlessly connect with Google Classroom to import student data and export generated content.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Google</span>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Sync</span>
              </div>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 p-6 bg-card/30 rounded-xl border"
        >
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-3 rounded-full bg-primary/10">
              <PenLine className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium">For Teachers</h3>
            <p className="text-sm text-muted-foreground">Streamline your lesson planning, save time on content creation and get AI help with assessments.</p>
          </div>
          
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-3 rounded-full bg-primary/10">
              <Book className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium">For Students</h3>
            <p className="text-sm text-muted-foreground">Receive personalized learning experiences, instant feedback and engaging educational content.</p>
          </div>
          
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-3 rounded-full bg-primary/10">
              <UserCheck className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium">For Administrators</h3>
            <p className="text-sm text-muted-foreground">Track student progress, identify areas for improvement and ensure curriculum alignment.</p>
          </div>
        </motion.div>

        <Tabs 
          defaultValue="chat" 
          value={activeTab} 
          onValueChange={handleTabChange} 
          className="w-full"
          id="gemini-tabs"
        >
          <TabsList className="grid w-full grid-cols-3 mb-6 p-1 bg-background/50 backdrop-blur-sm border">
            <TabsTrigger value="chat" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Bot className="mr-2 h-4 w-4" />
              Teaching Assistant
            </TabsTrigger>
            <TabsTrigger value="generate" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="mr-2 h-4 w-4" />
              Content Generator
            </TabsTrigger>
            <TabsTrigger value="analyze" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Brain className="mr-2 h-4 w-4" />
              Student Work Analysis
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="h-[600px]">
            <GeminiAI 
              mode="chat"
              title="Gemini Teaching Assistant"
              description="Ask questions about teaching strategies, subject matter, or classroom management"
              placeholder="Ask your teaching questions..."
            />
          </TabsContent>
          
          <TabsContent value="generate" className="h-[600px]">
            <GeminiAI 
              mode="generate"
              title="Content Generator"
              description="Create lesson plans, activities, quizzes, and other educational content"
              placeholder="Describe what content you want to generate..."
            />
          </TabsContent>
          
          <TabsContent value="analyze" className="h-[600px]">
            <GeminiAI 
              mode="analyze"
              title="Student Work Analysis"
              description="Get insights and feedback on student submissions and performance"
              placeholder="Describe student work you want analyzed..."
            />
          </TabsContent>
        </Tabs>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          <p>
            Powered by Google's Gemini AI technology. To use these features, you need a Gemini API key.
            <br />
            Get started at <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AI Studio</a>.
          </p>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default GeminiTools;
