
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageTransition from "@/components/layout/PageTransition";
import { motion } from "framer-motion";
import { GeminiAI } from "@/components/ai/GeminiAI";
import { Bot, FileText, Brain } from "lucide-react";

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
          <h1 className="text-3xl font-bold mb-3">Gemini AI Tools</h1>
          <p className="text-muted-foreground">
            Leverage Google's Gemini AI to enhance teaching and learning experiences
          </p>
        </motion.div>

        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="chat">
              <Bot className="mr-2 h-4 w-4" />
              Teaching Assistant
            </TabsTrigger>
            <TabsTrigger value="generate">
              <FileText className="mr-2 h-4 w-4" />
              Content Generator
            </TabsTrigger>
            <TabsTrigger value="analyze">
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
      </div>
    </PageTransition>
  );
};

export default GeminiTools;
