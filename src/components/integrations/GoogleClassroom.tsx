
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { School, Check, X, LogIn } from "lucide-react";
import { toast } from "sonner";

// Google OAuth client ID would be loaded from environment variables in a production app
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID";
const GOOGLE_API_SCOPES = [
  "https://www.googleapis.com/auth/classroom.courses.readonly",
  "https://www.googleapis.com/auth/classroom.rosters.readonly",
  "https://www.googleapis.com/auth/classroom.profile.emails",
];

interface GoogleClassroomProps {
  onAuthSuccess?: (token: string) => void;
  onImport?: (courses: any[]) => void;
}

export function GoogleClassroom({ onAuthSuccess, onImport }: GoogleClassroomProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [authToken, setAuthToken] = useState<string>("");

  // Initialize the Google API client
  const initializeGoogleApi = async () => {
    return new Promise<void>((resolve) => {
      if (window.gapi) {
        window.gapi.load("client:auth2", async () => {
          try {
            await window.gapi.client.init({
              clientId: GOOGLE_CLIENT_ID,
              scope: GOOGLE_API_SCOPES.join(" "),
              discoveryDocs: ["https://classroom.googleapis.com/$discovery/rest?version=v1"],
            });
            resolve();
          } catch (error) {
            console.error("Error initializing Google API:", error);
            toast.error("Failed to initialize Google API");
          }
        });
      } else {
        // Load the Google API script if not available
        const script = document.createElement("script");
        script.src = "https://apis.google.com/js/api.js";
        script.onload = () => initializeGoogleApi().then(resolve);
        document.body.appendChild(script);
      }
    });
  };

  // Handle Google Classroom authentication
  const handleConnect = async () => {
    setIsLoading(true);
    
    try {
      await initializeGoogleApi();
      
      // Authenticate with Google
      const authResponse = await window.gapi.auth2.getAuthInstance().signIn();
      const token = authResponse.getAuthResponse().access_token;
      setAuthToken(token);
      
      if (onAuthSuccess) {
        onAuthSuccess(token);
      }
      
      // Fetch courses using the Google Classroom API
      await fetchCourses(token);
      
      setIsConnected(true);
      toast.success("Connected to Google Classroom successfully");
    } catch (error) {
      console.error("Error connecting to Google Classroom:", error);
      toast.error("Failed to connect to Google Classroom");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch courses from Google Classroom API
  const fetchCourses = async (token: string) => {
    try {
      const response = await window.gapi.client.classroom.courses.list({
        teacherId: "me",
        pageSize: 20,
      });
      
      const courses = response.result.courses || [];
      setAvailableCourses(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to fetch courses");
    }
  };

  const handleDisconnect = () => {
    try {
      if (window.gapi && window.gapi.auth2) {
        window.gapi.auth2.getAuthInstance().signOut();
      }
      setIsConnected(false);
      setAvailableCourses([]);
      setAuthToken("");
      toast.info("Disconnected from Google Classroom");
    } catch (error) {
      console.error("Error disconnecting from Google Classroom:", error);
      toast.error("Failed to disconnect from Google Classroom");
    }
  };

  const handleImport = (courseId: string) => {
    const course = availableCourses.find(c => c.id === courseId);
    
    if (!course) {
      toast.error("Course not found");
      return;
    }
    
    toast.loading(`Importing ${course.name}...`, { duration: 1500 });
    
    // Import course using the Google Classroom API
    // In a production app, you would have more complex import logic
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
            
            {availableCourses.length === 0 && (
              <div className="text-center text-muted-foreground py-4">
                No courses found in your Google Classroom account
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
            {isLoading ? "Connecting..." : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Connect to Google Classroom
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

// Add TypeScript declarations for Google API
declare global {
  interface Window {
    gapi: {
      load: (api: string, callback: () => void) => void;
      client: {
        init: (config: any) => Promise<void>;
        classroom: {
          courses: {
            list: (params: any) => Promise<{
              result: {
                courses: any[];
              };
            }>;
          };
        };
      };
      auth2: {
        getAuthInstance: () => {
          signIn: () => Promise<{
            getAuthResponse: () => {
              access_token: string;
            };
          }>;
          signOut: () => Promise<void>;
        };
      };
    };
  }
}
