
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageTransition from "@/components/layout/PageTransition";
import { motion } from "framer-motion";
import { GeminiAI } from "@/components/ai/GeminiAI";
import { Bot, FileText, Brain, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

const GeminiTools = () => {
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
            <span className="font-medium text-primary">AI-Powered Tools</span>
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Gemini AI Tools</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Leverage Google's advanced Gemini AI technology to enhance teaching experiences and create engaging learning materials
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-primary/5 to-blue-500/5 p-6 border border-primary/10 h-full">
              <Bot className="h-10 w-10 mb-3 text-primary" />
              <h3 className="text-lg font-medium mb-2">Teaching Assistant</h3>
              <p className="text-sm text-muted-foreground">
                Get instant answers to your educational questions, teaching strategies, and classroom management.
              </p>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-primary/5 to-blue-500/5 p-6 border border-primary/10 h-full">
              <FileText className="h-10 w-10 mb-3 text-primary" />
              <h3 className="text-lg font-medium mb-2">Content Generator</h3>
              <p className="text-sm text-muted-foreground">
                Create personalized lesson plans, assignments, quizzes, and educational materials tailored to your curriculum.
              </p>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-primary/5 to-blue-500/5 p-6 border border-primary/10 h-full">
              <Brain className="h-10 w-10 mb-3 text-primary" />
              <h3 className="text-lg font-medium mb-2">Student Work Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Analyze student submissions to identify patterns, misconceptions, and provide targeted feedback.
              </p>
            </Card>
          </motion.div>
        </div>

        <Tabs defaultValue="chat" className="w-full">
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
            Powered by Google's Gemini AI technology. To use these features, you'll need a Gemini API key.
            <br />
            Get started at <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AI Studio</a>.
          </p>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default GeminiTools;
