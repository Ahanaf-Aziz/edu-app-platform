
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VoiceButton } from "@/components/ui/voice-button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  BookOpen,
  CheckCircle2,
  Lightbulb,
  FileText,
  Mic,
  Calendar as CalendarIcon,
  ListChecks,
  Bookmark,
  School,
} from "lucide-react";
import PageTransition from "@/components/layout/PageTransition";
import { toast } from "sonner";
import { GoogleClassroom } from "@/components/integrations/GoogleClassroom";
import { GeminiAI } from "@/components/ai/GeminiAI";

// Sample data
const plannedLessons = [
  {
    id: 1,
    title: "Introduction to Photosynthesis",
    subject: "Biology",
    grade: "9th Grade",
    date: "May 20, 2023",
    status: "Ready",
    duration: "45 min",
  },
  {
    id: 2,
    title: "Linear Equations",
    subject: "Mathematics",
    grade: "8th Grade",
    date: "May 22, 2023",
    status: "Draft",
    duration: "60 min",
  },
];

const TeachSmart = () => {
  const [lessonGoal, setLessonGoal] = useState("");
  const [activeTab, setActiveTab] = useState("create");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [planGenerated, setPlanGenerated] = useState(false);
  const [lessonSubject, setLessonSubject] = useState("science");
  const [lessonGrade, setLessonGrade] = useState("9th");
  const [lessonDuration, setLessonDuration] = useState("45");
  const [isConnectedToClassroom, setIsConnectedToClassroom] = useState(false);
  const [classroomAuthToken, setClassroomAuthToken] = useState("");
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  const startListening = () => {
    setIsListening(true);
    toast.info("Listening for lesson goals...", { duration: 1500 });
  };

  const stopListening = () => {
    setIsListening(false);
    setIsProcessing(true);
    
    // Simulate voice processing
    setTimeout(() => {
      setLessonGoal("Teach students about renewable energy sources and their environmental impacts, focusing on solar and wind power.");
      setIsProcessing(false);
      toast.success("Voice input captured!", { duration: 1500 });
    }, 1500);
  };

  const generateLessonPlan = () => {
    if (!lessonGoal.trim()) {
      toast.error("Please enter lesson goals first");
      return;
    }
    
    toast.loading("Generating your lesson plan...", { duration: 2000 });
    
    setTimeout(() => {
      setPlanGenerated(true);
      toast.success("Lesson plan generated successfully!");
    }, 2000);
  };

  const saveLessonPlan = () => {
    if (isConnectedToClassroom) {
      toast.success("Lesson plan saved and published to Google Classroom!");
    } else {
      toast.success("Lesson plan saved! Would you like to integrate with Google Classroom?", {
        action: {
          label: "Connect",
          onClick: () => setActiveTab("integrations"),
        },
      });
    }
    
    setLessonGoal("");
    setPlanGenerated(false);
    setActiveTab("planned");
  };

  const handleClassroomAuth = (token: string) => {
    setClassroomAuthToken(token);
    setIsConnectedToClassroom(true);
  };

  const handleClassroomImport = (courses: any[]) => {
    // Would update state with imported courses
    console.log("Imported courses:", courses);
  };

  const toggleAIAssistant = () => {
    setShowAIAssistant(!showAIAssistant);
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
          <h1 className="text-3xl font-bold mb-3">TeachSmart</h1>
          <p className="text-muted-foreground">
            Create AI-generated lesson plans with voice input and smart scheduling
          </p>
        </motion.div>

        <Card className="bg-card/50 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle>Lesson Planner</CardTitle>
            <CardDescription>
              Create and manage your lesson plans with AI assistance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="create">
                  <FileText className="mr-2 h-4 w-4" />
                  Create New
                </TabsTrigger>
                <TabsTrigger value="planned">
                  <Calendar className="mr-2 h-4 w-4" />
                  Planned Lessons
                </TabsTrigger>
                <TabsTrigger value="integrations">
                  <School className="mr-2 h-4 w-4" />
                  Integrations
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="create" className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="lessonGoal">Lesson Goals</Label>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={toggleAIAssistant}
                      >
                        <Lightbulb className="mr-2 h-4 w-4" />
                        AI Assistant
                      </Button>
                    </div>
                    <div className="flex space-x-2">
                      <Textarea
                        id="lessonGoal"
                        placeholder="Describe what you want students to learn in this lesson..."
                        value={lessonGoal}
                        onChange={(e) => setLessonGoal(e.target.value)}
                        className="flex-1"
                      />
                      <VoiceButton
                        onStart={startListening}
                        onStop={stopListening}
                        isListening={isListening}
                        isProcessing={isProcessing}
                        className="h-[inherit]"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Select
                        value={lessonSubject}
                        onValueChange={setLessonSubject}
                      >
                        <SelectTrigger id="subject">
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="math">Mathematics</SelectItem>
                          <SelectItem value="science">Science</SelectItem>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="history">History</SelectItem>
                          <SelectItem value="art">Art</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="grade">Grade Level</Label>
                      <Select
                        value={lessonGrade}
                        onValueChange={setLessonGrade}
                      >
                        <SelectTrigger id="grade">
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6th">6th Grade</SelectItem>
                          <SelectItem value="7th">7th Grade</SelectItem>
                          <SelectItem value="8th">8th Grade</SelectItem>
                          <SelectItem value="9th">9th Grade</SelectItem>
                          <SelectItem value="10th">10th Grade</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Select
                        value={lessonDuration}
                        onValueChange={setLessonDuration}
                      >
                        <SelectTrigger id="duration">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                          <SelectItem value="90">90 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Button onClick={generateLessonPlan} className="w-full">
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Generate Lesson Plan
                  </Button>
                </div>
                
                {showAIAssistant && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border rounded-lg overflow-hidden"
                  >
                    <div className="h-[350px]">
                      <GeminiAI 
                        mode="generate"
                        title="Lesson Planning Assistant"
                        description="Get help crafting effective lesson goals and objectives"
                        placeholder="Ask for suggestions on your lesson plan..."
                      />
                    </div>
                  </motion.div>
                )}
                
                {planGenerated && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg p-4 bg-card shadow-subtle mt-6"
                  >
                    <h3 className="font-medium text-lg mb-4">Renewable Energy Sources: Solar and Wind Power</h3>
                    
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium flex items-center">
                          <BookOpen className="h-4 w-4 mr-2 text-primary" />
                          Learning Objectives
                        </h4>
                        <ul className="mt-2 text-sm space-y-2">
                          <li className="flex items-start">
                            <span className="text-primary mr-2">•</span>
                            <span>Explain how solar and wind energy are harnessed for electricity</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-primary mr-2">•</span>
                            <span>Compare the environmental impacts of renewable vs. non-renewable energy</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-primary mr-2">•</span>
                            <span>Analyze data on energy efficiency and cost-effectiveness</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-primary" />
                          Lesson Timeline
                        </h4>
                        <ul className="mt-2 text-sm space-y-2">
                          <li className="flex items-start">
                            <span className="text-primary mr-2">•</span>
                            <span><strong>Introduction (5 minutes):</strong> Brief overview of energy sources</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-primary mr-2">•</span>
                            <span><strong>Solar Power (15 minutes):</strong> Video, discussion, collaborative activity</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-primary mr-2">•</span>
                            <span><strong>Wind Power (15 minutes):</strong> Interactive diagram, case study</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-primary mr-2">•</span>
                            <span><strong>Assessment (10 minutes):</strong> Group challenge and exit quiz</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium flex items-center">
                          <ListChecks className="h-4 w-4 mr-2 text-primary" />
                          Resources
                        </h4>
                        <ul className="mt-2 text-sm space-y-2">
                          <li className="flex items-start">
                            <span className="text-primary mr-2">•</span>
                            <span>"How Solar Panels Work" - NASA Educational Video</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-primary mr-2">•</span>
                            <span>Interactive Wind Turbine Diagram - National Geographic</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-primary mr-2">•</span>
                            <span>Renewable Energy Data Charts - U.S. Energy Information Administration</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button onClick={saveLessonPlan} className="flex-1">
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          {isConnectedToClassroom ? "Save & Publish to Classroom" : "Save Lesson Plan"}
                        </Button>
                        <Button variant="outline" onClick={() => setPlanGenerated(false)} className="flex-1">
                          Edit
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </TabsContent>
              
              <TabsContent value="planned" className="space-y-4">
                {plannedLessons.map((lesson, index) => (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="border rounded-lg p-4 bg-card shadow-subtle"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <h3 className="font-medium">{lesson.title}</h3>
                          <Badge
                            variant={lesson.status === "Ready" ? "default" : "secondary"}
                            className="ml-2"
                          >
                            {lesson.status}
                          </Badge>
                          {isConnectedToClassroom && (
                            <Badge variant="outline" className="ml-2">
                              <School className="h-3 w-3 mr-1" />
                              Classroom
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1 space-y-1">
                          <div className="flex items-center">
                            <BookOpen className="h-3 w-3 mr-2" />
                            <span>{lesson.subject} - {lesson.grade}</span>
                          </div>
                          <div className="flex items-center">
                            <CalendarIcon className="h-3 w-3 mr-2" />
                            <span>{lesson.date}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-2" />
                            <span>{lesson.duration}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Bookmark className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </TabsContent>
              
              <TabsContent value="integrations" className="space-y-4">
                <GoogleClassroom 
                  onAuthSuccess={handleClassroomAuth}
                  onImport={handleClassroomImport}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
};

export default TeachSmart;
