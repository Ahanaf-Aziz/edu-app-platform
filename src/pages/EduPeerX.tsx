
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
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
} from "lucide-react";
import PageTransition from "@/components/layout/PageTransition";
import { toast } from "sonner";

const assignments = [
  {
    id: 1,
    title: "Essay on Climate Change",
    description: "Discuss the impacts of climate change on global ecosystems",
    dueDate: "May 15, 2023",
    status: "Pending Review",
    numReviews: 2,
  },
  {
    id: 2,
    title: "Math Problem Set",
    description: "Solve the differential equations and explain your approach",
    dueDate: "May 20, 2023",
    status: "Completed",
    numReviews: 3,
  },
];

const peerWork = [
  {
    id: 101,
    studentName: "Alex Johnson",
    title: "The Impact of Social Media",
    preview: "Social media has transformed how we communicate and share information...",
    reviewStatus: "Ready for Review",
  },
  {
    id: 102,
    studentName: "Sam Wilson",
    title: "Analysis of Macbeth",
    preview: "Shakespeare's Macbeth explores themes of ambition and moral corruption...",
    reviewStatus: "Ready for Review",
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

const EduPeerX = () => {
  const [activeTab, setActiveTab] = useState("assignments");
  const [reviewText, setReviewText] = useState("");
  const [showReview, setShowReview] = useState(false);
  const [progress, setProgress] = useState(65);

  const handleSubmitReview = () => {
    if (reviewText.trim().length < 10) {
      toast.error("Please provide more detailed feedback");
      return;
    }
    
    toast.success("Review submitted successfully!");
    setReviewText("");
    setShowReview(false);
    setProgress((prev) => Math.min(prev + 10, 100));
  };

  const startReview = () => {
    setShowReview(true);
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
                    {assignments.map((assignment) => (
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
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="review" className="space-y-4">
                    {!showReview ? (
                      peerWork.map((work) => (
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
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-3"
                                onClick={startReview}
                              >
                                Start Review
                              </Button>
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
                          <h3 className="font-medium mb-2">Review: The Impact of Social Media</h3>
                          <div className="bg-muted/30 rounded-lg p-3 text-sm mb-4">
                            <p>Social media has transformed how we communicate and share information in the modern world. Platforms like Facebook, Twitter, and Instagram have created new ways for people to connect, but they have also raised concerns about privacy, mental health, and the spread of misinformation.</p>
                            <p className="mt-2">The convenience of staying connected has to be weighed against the potential negative effects on society. This essay explores both sides of this debate.</p>
                          </div>
                          
                          <div className="bg-primary/10 rounded-lg p-3 mb-4">
                            <h4 className="text-sm font-medium text-primary mb-2">AI Review Guidelines:</h4>
                            <ul className="text-sm space-y-2">
                              <li className="flex items-start">
                                <span className="text-primary mr-2">•</span>
                                <span>Comment on the clarity of their thesis statement</span>
                              </li>
                              <li className="flex items-start">
                                <span className="text-primary mr-2">•</span>
                                <span>Suggest ways to strengthen their supporting evidence</span>
                              </li>
                              <li className="flex items-start">
                                <span className="text-primary mr-2">•</span>
                                <span>Consider if they've addressed counterarguments</span>
                              </li>
                            </ul>
                          </div>
                          
                          <Textarea
                            placeholder="Write your feedback here... Be constructive and specific."
                            className="min-h-[120px]"
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                          />
                          
                          <div className="flex space-x-2 mt-4">
                            <Button onClick={handleSubmitReview}>
                              <Send className="h-4 w-4 mr-2" />
                              Submit Review
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setShowReview(false)}
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
