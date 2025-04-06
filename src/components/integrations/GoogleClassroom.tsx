
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { School, Check, X } from "lucide-react";
import { toast } from "sonner";

interface GoogleClassroomProps {
  onAuthSuccess?: (token: string) => void;
  onImport?: (courses: any[]) => void;
}

export function GoogleClassroom({ onAuthSuccess, onImport }: GoogleClassroomProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);

  // Mock function for Google Classroom authentication
  const handleConnect = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsConnected(true);
      setIsLoading(false);
      
      // Mock courses data
      const mockCourses = [
        { id: "1", name: "Biology 101", section: "Period 2", ownerId: "teacher1" },
        { id: "2", name: "World History", section: "Period 3", ownerId: "teacher1" },
        { id: "3", name: "Algebra II", section: "Period 1", ownerId: "teacher1" }
      ];
      
      setAvailableCourses(mockCourses);
      
      if (onAuthSuccess) {
        onAuthSuccess("mock-auth-token");
      }
      
      toast.success("Connected to Google Classroom successfully");
    }, 1500);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setAvailableCourses([]);
    toast.info("Disconnected from Google Classroom");
  };

  const handleImport = (courseId: string) => {
    const course = availableCourses.find(c => c.id === courseId);
    
    toast.loading(`Importing ${course.name}...`, { duration: 1500 });
    
    // Simulate import
    setTimeout(() => {
      if (onImport) {
        onImport([course]);
      }
      toast.success(`${course.name} imported successfully`);
    }, 1500);
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex items-center space-x-2">
          <School className="h-5 w-5 text-primary" />
          <CardTitle>Google Classroom</CardTitle>
        </div>
        <CardDescription>
          Connect with Google Classroom to import courses, assignments, and student data
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isConnected ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm text-green-600 font-medium">
              <Check className="h-4 w-4" />
              <span>Connected to Google Classroom</span>
            </div>
            
            {availableCourses.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Your Courses</h4>
                <div className="space-y-2">
                  {availableCourses.map((course) => (
                    <div 
                      key={course.id}
                      className="flex items-center justify-between rounded-md border p-3 text-sm"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{course.name}</div>
                        <div className="text-muted-foreground">{course.section}</div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleImport(course.id)}
                      >
                        Import
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <School className="h-12 w-12 text-muted-foreground" />
            <div className="text-center space-y-2">
              <h4 className="font-medium">Not Connected</h4>
              <p className="text-sm text-muted-foreground">
                Connect to Google Classroom to import your courses and assignments
              </p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {isConnected ? (
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleDisconnect}
          >
            <X className="mr-2 h-4 w-4" />
            Disconnect
          </Button>
        ) : (
          <Button 
            className="w-full" 
            onClick={handleConnect}
            disabled={isLoading}
          >
            {isLoading ? "Connecting..." : "Connect to Google Classroom"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
