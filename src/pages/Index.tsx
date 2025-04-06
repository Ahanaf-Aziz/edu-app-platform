
import { motion } from "framer-motion";
import { Mic, Users, Calendar, Bot } from "lucide-react";
import { FeatureCard } from "@/components/ui/feature-card";
import PageTransition from "@/components/layout/PageTransition";

const features = [
  {
    title: "EduBot",
    description: "Get instant feedback on your answers and questions using voice or text input.",
    icon: <Mic className="h-6 w-6" />,
    href: "/edubot",
  },
  {
    title: "EduPeerX",
    description: "Participate in AI-guided peer reviews with badges and rewards for engagement.",
    icon: <Users className="h-6 w-6" />,
    href: "/edupeerx",
  },
  {
    title: "TeachSmart",
    description: "Generate structured lesson plans with AI using voice input and smart scheduling.",
    icon: <Calendar className="h-6 w-6" />,
    href: "/teachsmart",
  },
  {
    title: "Gemini Tools",
    description: "Leverage Google's Gemini AI to create content, analyze student work, and get teaching assistance.",
    icon: <Bot className="h-6 w-6" />,
    href: "/geminitools",
  },
];

const Index = () => {
  return (
    <PageTransition>
      <div className="flex flex-col items-center space-y-16 py-8 md:py-16">
        <section className="text-center space-y-6 max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
              Welcome to EduSuite
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
              Revolutionize Learning with AI
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Enhance teaching and learning with our powerful AI-driven tools designed to provide instant feedback, foster peer collaboration, and streamline lesson planning.
            </p>
          </motion.div>
        </section>

        <section className="w-full max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                href={feature.href}
                delay={index}
              />
            ))}
          </div>
        </section>

        <section className="w-full max-w-4xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-card border rounded-xl p-8 shadow-subtle space-y-6"
          >
            <h2 className="text-2xl font-semibold text-center">Why Choose EduSuite?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">For Students</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Receive immediate, personalized feedback</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Develop critical thinking through peer review</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Earn recognition with badges and rewards</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">For Teachers</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Save time with AI-generated lesson plans</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Access personalized learning resources</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Seamlessly integrate with Google Classroom</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </PageTransition>
  );
};

export default Index;
