
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { User, Bot } from "lucide-react";
import { motion } from "framer-motion";

interface MessageBubbleProps {
  content: string;
  sender: "user" | "assistant";
  timestamp?: string;
  isLoading?: boolean;
  className?: string;
}

export function MessageBubble({
  content,
  sender,
  timestamp,
  isLoading = false,
  className,
}: MessageBubbleProps) {
  const bubbleRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (bubbleRef.current) {
      bubbleRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [content]);

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const loadingVariants = {
    start: {
      opacity: 0.5,
    },
    end: {
      opacity: 1,
      transition: {
        duration: 0.8,
        repeat: Infinity,
        repeatType: "reverse",
      },
    },
  };

  return (
    <motion.div
      ref={bubbleRef}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={cn(
        "flex w-full mb-4",
        sender === "user" ? "justify-end" : "justify-start",
        className
      )}
    >
      <div
        className={cn(
          "flex max-w-[80%] md:max-w-[70%]",
          sender === "user" ? "flex-row-reverse" : "flex-row"
        )}
      >
        <div
          className={cn(
            "flex flex-shrink-0 items-start justify-center rounded-full w-8 h-8 mt-1",
            sender === "user" ? "ml-2 bg-primary/10" : "mr-2 bg-secondary"
          )}
        >
          {sender === "user" ? (
            <User className="h-4 w-4 mt-2 text-primary" />
          ) : (
            <Bot className="h-4 w-4 mt-2 text-muted-foreground" />
          )}
        </div>
        
        <div
          className={cn(
            "rounded-2xl px-4 py-3 shadow-subtle",
            sender === "user"
              ? "bg-primary text-primary-foreground"
              : "bg-card border"
          )}
        >
          {isLoading ? (
            <motion.div
              variants={loadingVariants}
              initial="start"
              animate="end"
              className="flex space-x-2 h-6 items-center"
            >
              <div className="bg-current rounded-full h-1.5 w-1.5 opacity-50" />
              <div className="bg-current rounded-full h-1.5 w-1.5 opacity-70" />
              <div className="bg-current rounded-full h-1.5 w-1.5 opacity-90" />
            </motion.div>
          ) : (
            <>
              <div className="prose-sm max-w-none">
                {content}
              </div>
              {timestamp && (
                <div
                  className={cn(
                    "text-xs mt-1 opacity-70",
                    sender === "user" ? "text-right" : "text-left"
                  )}
                >
                  {timestamp}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
