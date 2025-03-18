
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  href: string;
  className?: string;
  delay?: number;
}

export function FeatureCard({
  title,
  description,
  icon,
  href,
  className,
  delay = 0,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: delay * 0.1,
        ease: [0.25, 0.25, 0, 1],
      }}
    >
      <Link to={href}>
        <div
          className={cn(
            "group relative overflow-hidden rounded-xl border backdrop-blur-sm bg-card/50 p-6 shadow-subtle hover:shadow-hover transition-all duration-300 ease-in-out hover:-translate-y-1",
            className
          )}
        >
          <div className="flex flex-col space-y-4">
            <div className="text-primary p-2 rounded-full bg-primary/10 w-fit">
              {icon}
            </div>
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
          </div>
          <div className="flex items-center mt-6 font-medium text-primary">
            <span>Get started</span>
            <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
          </div>
          <div className="absolute top-0 right-0 bottom-0 left-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent to-primary/5 transition-opacity duration-300 pointer-events-none" />
        </div>
      </Link>
    </motion.div>
  );
}
