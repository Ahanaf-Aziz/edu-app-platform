import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  Users,
  CheckCircle2,
  Award,
  Send,
  ThumbsUp,
  ThumbsDown,
  Trophy,
  Clock,
  Shield,
  FileText,
  Upload,
  File,
  Mic,
  AlertTriangle,
  Bot,
  Brain,
  MessageSquare,
  PlusCircle,
} from "lucide-react";
import PageTransition from "@/components/layout/PageTransition";
import { toast } from "sonner";
import FileUpload, { FileMetadata } from "@/components/FileUpload";
import { MessageBubble } from "@/components/ui/message-bubble";

interface Assignment {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  status: string;
  numReviews: number;
  attachments: FileMetadata[];
}

interface PeerWork {
  id: number;
  studentName: string;
  title: string;
  preview: string;
  reviewStatus: string;
  attachments: FileMetadata[];
}

const assignments: Assignment[] = [
  {
    id: 1,
    title: "Essay on Climate Change",
    description: "Discuss the impacts of climate change on global ecosystems",
    dueDate: "May 15, 2023",
    status: "Pending Review",
    numReviews: 2,
    attachments: [],
  },
  {
    id: 2,
    title: "Math Problem Set",
    description: "Solve the differential equations and explain your approach",
    dueDate: "May 20, 2023",
    status: "Completed",
    numReviews: 3,
    attachments: [],
  },
];

const peerWork: PeerWork[] = [
  {
    id: 101,
    studentName: "Alex Johnson",
    title: "The Impact of Social Media",
    preview: "Social media has transformed how we communicate and share information...",
    reviewStatus: "Ready for Review",
    attachments: [],
  },
  {
    id: 102,
    studentName: "Sam Wilson",
    title: "Analysis of Macbeth",
    preview: "Shakespeare's Macbeth explores themes of ambition and moral corruption...",
    reviewStatus: "Ready for Review",
    attachments: [],
  },
];

const badges = [
  {
    id: 1,
    name: "Helpful Reviewer",
    description: "Provided constructive feedback on 5+ assignments",
    icon: <ThumbsUp className="h-8 w-8" />,
    earned: true,
  },
  {
    id: 2,
    name: "Critical Thinker",
    description: "Consistently asks insightful questions in reviews",
    icon: <Shield className="h-8 w-8" />,
    earned: true,
  },
  {
    id: 3,
    name: "Top Contributor",
    description: "In the top 10% of reviewers this month",
    icon: <Trophy className="h-8 w-8" />,
    earned: false,
  },
];

const aiGuidelines = {
  "Essay on Climate Change": [
    "Check if the essay addresses the main impacts of climate change",
    "Verify if scientific evidence is properly cited",
    "Look for a clear thesis statement and conclusion",
    "Assess if counterarguments are addressed"
  ],
  "Math Problem Set": [
    "Verify the correctness of mathematical operations",
    "Check if proper formulas are applied",
    "Assess if the approach is clearly explained",
    "Look for proper units in the answer"
  ],
  "The Impact of Social Media": [
    "Check if both positive and negative impacts are discussed",
    "Verify if the essay provides real-world examples",
    "Assess the clarity of arguments",
    "Look for a balanced perspective"
  ],
  "Analysis of Macbeth": [
    "Check if key themes are identified and analyzed",
    "Verify if textual evidence supports the analysis",
    "Assess the depth of character analysis",
    "Look for connections to historical context"
  ]
};

const aiFeedbackSuggestions = [
  "Consider adding more specific examples to strengthen your point about...",
  "The argument could be more convincing with additional evidence for...",
  "Your analysis of [topic] is strong, but you might want to also consider...",
  "Try to connect your points more clearly to the main thesis by...",
  "The structure could be improved by reorganizing the section about..."
];

const EduPeerX = () => {
  const [activeTab, setActiveTab] = useState("assignments");
  const [reviewText, setReviewText] = useState("");
  const [showReview, setShowReview] = useState(false);
  const [progress, setProgress] = useState(65);
  const [myAssignments, setMyAssignments] = useState<Assignment[]>(assignments);
  const [peerAssignments, setPeerAssignments] = useState<PeerWork[]>(peerWork);
  const [selectedAssignment, setSelectedAssignment] = useState<number | null>(null);
  const [showUploadForm, setShowUploadForm] = useState<{ type: "assignment" | "peer", id: number } | null>(null);
  const [reviewMessages, setReviewMessages] = useState<{role: "user" | "assistant", content: string}[]>([]);
  const [currentAssignmentTitle, setCurrentAssignmentTitle] = useState("");
  const [showAIGuidelines, setShowAIGuidelines] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [biasDetected, setBiasDetected] = useState(false);
  const [showNewAssignmentForm, setShowNewAssignmentForm] = useState(false);

  const handleSubmitReview = () => {
    if (reviewText.trim().length < 10) {
      toast.error("Please provide more detailed feedback");
      return;
    }
    
    const hasBias = Math.random() > 0.7;
    
    if (hasBias) {
      setBiasDetected(true);
      toast.warning("Potential bias detected in your review. Please revise for fairness.", {
        duration: 5000,
      });
      return;
    }
    
    toast.success("Review submitted successfully!");
    setReviewText("");
    setShowReview(false);
    setProgress((prev) => Math.min(prev + 10, 100));
    setBiasDetected(false);
    setAiSuggestion("");
    setReviewMessages([]);
  };

  const startReview = (title: string) => {
    setCurrentAssignmentTitle(title);
    setShowReview(true);
    setReviewMessages([
      {
        role: "assistant",
        content: `I'll help you review "${title}". Let me suggest some guidelines for your feedback.`
      }
    ]);
    setShowAIGuidelines(true);
  };

  const handleFileUpload = (file: File, metadata: FileMetadata) => {
    if (!showUploadForm && !showNewAssignmentForm) return;
    
    if (showNewAssignmentForm) {
      const newAssignment: Assignment = {
        id: Math.max(...myAssignments.map(a => a.id)) + 1,
        title: metadata.title || "New Assignment",
        description: metadata.description || "No description provided",
        dueDate: metadata.dueDate ? format(metadata.dueDate, "MMMM d, yyyy") : "No due date",
        status: "Not Submitted",
        numReviews: 0,
        attachments: [metadata],
      };
      
      setMyAssignments(prev => [...prev, newAssignment]);
      setShowNewAssignmentForm(false);
      toast.success("New assignment created successfully!");
      return;
    }
    
    if (!showUploadForm) return;
    
    if (showUploadForm.type === "assignment") {
      setMyAssignments(prev => 
        prev.map(assignment => 
          assignment.id === showUploadForm.id 
            ? { ...assignment, attachments: [...assignment.attachments, metadata] }
            : assignment
        )
      );
      toast.success("Document uploaded to assignment!");
    } else {
      setPeerAssignments(prev => 
        prev.map(work => 
          work.id === showUploadForm.id 
            ? { ...work, attachments: [...work.attachments, metadata] }
            : work
        )
      );
      toast.success("Document uploaded for peer review!");
    }
    
    setShowUploadForm(null);
    setSelectedAssignment(null);
  };

  const toggleUploadForm = (type: "assignment" | "peer", id: number) => {
    if (showUploadForm && showUploadForm.id === id && showUploadForm.type === type) {
      setShowUploadForm(null);
    } else {
      setShowUploadForm({ type, id });
      setSelectedAssignment(id);
    }
  };

  const handleVoiceInput = (text: string) => {
    if (showReview) {
      setReviewText(text);
      const randomSuggestion = aiFeedbackSuggestions[Math.floor(Math.random() * aiFeedbackSuggestions.length)];
      setAiSuggestion(randomSuggestion);
      
      setReviewMessages(prev => [
        ...prev,
        { role: "user", content: text },
        { role: "assistant", content: `Here's a suggestion to improve your feedback: ${randomSuggestion}` }
      ]);
    }
  };

  const getReviewGuidelines = () => {
    const guidelines = aiGuidelines[currentAssignmentTitle as keyof typeof aiGuidelines] || [];
    return guidelines.length > 0 ? guidelines : aiGuidelines["Essay on Climate Change"];
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return "Unknown date";
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
          <h1 className="text-3xl font-bold mb-3">EduPeerX</h1>
          <p className="text-muted-foreground">
            Participate in AI-guided peer reviews with fair feedback and rewards
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Peer Review Dashboard</CardTitle>
                <CardDescription>
                  Manage your assignments and peer reviews
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="assignments">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      My Assignments
                    </TabsTrigger>
                    <TabsTrigger value="review">
                      <Users className="mr-2 h-4 w-4" />
                      Peer Work
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="assignments" className="space-y-4">
                    <div className="flex justify-end mb-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowNewAssignmentForm(!showNewAssignmentForm)}
                        className="flex items-center"
                      >
                        <PlusCircle className="h-4 w-4 mr-1" />
                        {showNewAssignmentForm ? "Cancel" : "Create New Assignment"}
                      </Button>
                    </div>
                    
                    {showNewAssignmentForm && (
                      <div className="border rounded-lg p-4 bg-card shadow-subtle mb-4">
                        <h3 className="font-medium mb-3">Create New Assignment</h3>
                        <FileUpload 
                          onFileUpload={handleFileUpload}
                          showMetadataForm={true}
                          metadataType="assignment"
                          label="Upload Assignment Document"
                        />
                      </div>
                    )}
                    
                    {myAssignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="border rounded-lg p-4 bg-card shadow-subtle"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium mb-1">{assignment.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {assignment.description}
                            </p>
                            <div className="flex items-center text-sm">
                              <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                              <span className="text-muted-foreground">Due: {assignment.dueDate}</span>
                            </div>
                          </div>
                          <Badge
                            variant={assignment.status === "Completed" ? "default" : "secondary"}
                            className="ml-2"
                          >
                            {assignment.status}
                          </Badge>
                        </div>
                        
                        <div className="mt-4 text-sm">
                          <span>Reviews received: {assignment.numReviews}/3</span>
                          <Progress value={assignment.numReviews * 33.33} className="mt-2" />
                        </div>
                        
                        {assignment.attachments.length > 0 && (
                          <div className="mt-4 border-t pt-3">
                            <h4 className="text-sm font-medium mb-2 flex items-center">
                              <FileText className="h-4 w-4 mr-1" />
                              Attached Documents
                            </h4>
                            <div className="space-y-2">
                              {assignment.attachments.map((file, index) => (
                                <div key={index} className="flex items-center justify-between text-sm bg-muted/40 rounded p-2">
                                  <div className="flex items-center flex-1 truncate mr-2">
                                    <File className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                                    <div className="truncate">
                                      <p className="font-medium truncate">{file.fileName}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {formatFileSize(file.fileSize)} • Uploaded: {formatDate(file.uploadedAt)}
                                      </p>
                                    </div>
                                  </div>
                                  <Button variant="ghost" size="sm">Download</Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-4 flex justify-end">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => toggleUploadForm("assignment", assignment.id)}
                            className="flex items-center"
                          >
                            <Upload className="h-4 w-4 mr-1" />
                            {showUploadForm?.id === assignment.id && showUploadForm?.type === "assignment" 
                              ? "Cancel Upload" 
                              : "Upload Document"}
                          </Button>
                        </div>
                        
                        {showUploadForm?.id === assignment.id && showUploadForm?.type === "assignment" && (
                          <div className="mt-4 border-t pt-3">
                            <h4 className="text-sm font-medium mb-2">Upload Assignment Document</h4>
                            <FileUpload 
                              onFileUpload={handleFileUpload} 
                              showMetadataForm={true}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="review" className="space-y-4">
                    {!showReview ? (
                      peerAssignments.map((work) => (
                        <div
                          key={work.id}
                          className="border rounded-lg p-4 bg-card shadow-subtle"
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>{work.studentName.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium">{work.title}</h3>
                                  <p className="text-sm text-muted-foreground">By {work.studentName}</p>
                                </div>
                                <Badge>{work.reviewStatus}</Badge>
                              </div>
                              <p className="text-sm mt-2 line-clamp-2">{work.preview}</p>
                              
                              {work.attachments.length > 0 && (
                                <div className="mt-3">
                                  <h4 className="text-sm font-medium mb-1 flex items-center">
                                    <FileText className="h-3 w-3 mr-1" />
                                    Attached Documents
                                  </h4>
                                  <div className="space-y-1">
                                    {work.attachments.map((file, index) => (
                                      <div key={index} className="flex items-center justify-between text-xs bg-muted/40 rounded p-1.5">
                                        <div className="flex items-center flex-1 truncate mr-2">
                                          <File className="h-3 w-3 mr-1 text-primary flex-shrink-0" />
                                          <div className="truncate">
                                            <p className="font-medium truncate">{file.fileName}</p>
                                            <p className="text-xs text-muted-foreground">
                                              {formatFileSize(file.fileSize)} • Uploaded: {formatDate(file.uploadedAt)}
                                            </p>
                                          </div>
                                        </div>
                                        <Button variant="ghost" size="sm" className="h-6 px-2">View</Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              <div className="mt-3 flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => startReview(work.title)}
                                >
                                  <Brain className="h-3 w-3 mr-1" />
                                  Start AI-Guided Review
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => toggleUploadForm("peer", work.id)}
                                >
                                  <Upload className="h-3 w-3 mr-1" />
                                  {showUploadForm?.id === work.id && showUploadForm?.type === "peer" 
                                    ? "Cancel" 
                                    : "Upload"}
                                </Button>
                              </div>
                              
                              {showUploadForm?.id === work.id && showUploadForm?.type === "peer" && (
                                <div className="mt-3 pt-2 border-t">
                                  <FileUpload 
                                    onFileUpload={handleFileUpload} 
                                    label="Upload Supporting Document" 
                                    showMetadataForm={true}
                                    metadataType="peer"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border rounded-lg p-4 bg-card shadow-subtle"
                      >
                        <div className="mb-4">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium mb-2 flex items-center">
                              <Bot className="h-4 w-4 mr-2 text-primary" />
                              AI-Guided Review: {currentAssignmentTitle}
                            </h3>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setShowAIGuidelines(!showAIGuidelines)}
                            >
                              {showAIGuidelines ? "Hide Guidelines" : "Show Guidelines"}
                            </Button>
                          </div>
                          
                          {showAIGuidelines && (
                            <div className="bg-primary/10 rounded-lg p-3 mb-4">
                              <h4 className="text-sm font-medium text-primary mb-2 flex items-center">
                                <Brain className="h-4 w-4 mr-1" />
                                AI Review Guidelines:
                              </h4>
                              <ul className="text-sm space-y-2">
                                {getReviewGuidelines().map((guideline, index) => (
                                  <li key={index} className="flex items-start">
                                    <span className="text-primary mr-2">•</span>
                                    <span>{guideline}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          <div className="bg-muted/30 rounded-lg p-3 text-sm mb-4">
                            <p>Social media has transformed how we communicate and share information in the modern world. Platforms like Facebook, Twitter, and Instagram have created new ways for people to connect, but they have also raised concerns about privacy, mental health, and the spread of misinformation.</p>
                            <p className="mt-2">The convenience of staying connected has to be weighed against the potential negative effects on society. This essay explores both sides of this debate.</p>
                          </div>
                          
                          {reviewMessages.length > 0 && (
                            <div className="mb-4 p-3 border rounded-lg bg-muted/10">
                              <h4 className="text-sm font-medium mb-2 flex items-center">
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Chat with AI Assistant
                              </h4>
                              <div className="space-y-3 max-h-[200px] overflow-y-auto p-2">
                                {reviewMessages.map((message, idx) => (
                                  <MessageBubble
                                    key={idx}
                                    content={message.content}
                                    sender={message.role}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <label className="text-sm font-medium">Your Review Feedback:</label>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    setReviewMessages(prev => [
                                      ...prev, 
                                      { 
                                        role: "user", 
                                        content: "Can you suggest how to improve my feedback?" 
                                      },
                                      {
                                        role: "assistant",
                                        content: aiFeedbackSuggestions[Math.floor(Math.random() * aiFeedbackSuggestions.length)]
                                      }
                                    ]);
                                  }}
                                >
                                  <Bot className="h-3 w-3 mr-1" />
                                  Ask AI for Help
                                </Button>
                              </div>
                            </div>
                            
                            <Textarea
                              placeholder="Write your feedback here... Be constructive and specific."
                              className={`min-h-[120px] ${biasDetected ? 'border-destructive' : ''}`}
                              value={reviewText}
                              onChange={(e) => {
                                setReviewText(e.target.value);
                                setBiasDetected(false);
                              }}
                            />
                            
                            {biasDetected && (
                              <div className="flex items-start gap-2 p-2 border border-destructive/30 bg-destructive/10 rounded-md">
                                <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                                <div className="text-sm">
                                  <p className="font-medium text-destructive">Potential bias detected</p>
                                  <p className="text-destructive/80 text-xs mt-1">Your feedback may contain harsh criticism or unfair judgment. Please revise to ensure it's constructive and balanced.</p>
                                </div>
                              </div>
                            )}
                            
                            {aiSuggestion && !biasDetected && (
                              <div className="flex items-start gap-2 p-2 border border-primary/30 bg-primary/10 rounded-md">
                                <Bot className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                <div className="text-sm">
                                  <p className="font-medium text-primary">AI Suggestion</p>
                                  <p className="text-primary/80 text-xs mt-1">{aiSuggestion}</p>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <FileUpload 
                            onFileUpload={(file, metadata) => {}} 
                            onVoiceInput={handleVoiceInput} 
                            showVoiceInput={true}
                            label="Record Voice Feedback"
                          />
                          
                          <div className="flex space-x-2 mt-4">
                            <Button onClick={handleSubmitReview}>
                              <Send className="h-4 w-4 mr-2" />
                              Submit Review
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setShowReview(false);
                                setBiasDetected(false);
                                setAiSuggestion("");
                                setReviewMessages([]);
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-primary" />
                  Your Progress
                </CardTitle>
                <CardDescription>
                  Level up with peer reviews
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2 text-sm">
                    <span>Review Points</span>
                    <span className="font-medium">{progress}/100</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    Earn 100 points to reach the next level
                  </p>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Your Badges</h4>
                  {badges.map((badge) => (
                    <div
                      key={badge.id}
                      className={`flex items-center p-2 rounded-lg transition-colors ${
                        badge.earned
                          ? "bg-primary/10"
                          : "bg-muted/30 opacity-60"
                      }`}
                    >
                      <div className={`mr-3 text-${badge.earned ? "primary" : "muted-foreground"}`}>
                        {badge.icon}
                      </div>
                      <div>
                        <div className="font-medium text-sm flex items-center">
                          {badge.name}
                          {badge.earned && (
                            <CheckCircle2 className="h-3 w-3 ml-1 text-primary" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {badge.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default EduPeerX;
