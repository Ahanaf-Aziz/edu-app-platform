
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md mx-auto"
      >
        <div className="mb-6 relative">
          <div className="text-9xl font-bold text-primary opacity-10 select-none">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-4xl font-bold text-foreground">Page Not Found</h1>
          </div>
        </div>
        
        <p className="text-xl text-muted-foreground mb-8">
          We couldn't find the page you were looking for. It might have been moved or deleted.
        </p>
        
        <Link to="/">
          <Button size="lg" className="px-8">
            <Home className="mr-2 h-5 w-5" />
            Return Home
          </Button>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
