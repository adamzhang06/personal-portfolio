import { Button } from "@/components/Button";
import {
  ArrowRight,
  ChevronDown,
  Download,
  Github,
  Linkedin,
} from "lucide-react";
import { AnimatedBorderButton } from "../components/AnimatedBorderButton";

const skillCategories = [
  {
    label: "Languages",
    skills: ["Python", "R", "Java", "JavaScript", "HTML/CSS"],
  },
  {
    label: "Frameworks",
    skills: ["React", "React Native", "FastAPI", "Shiny"],
  },
  {
    label: "Libraries",
    skills: ["Pandas", "NumPy", "Matplotlib", "Scikit-learn", "Keras", "ggplot2", "Tailwind CSS"],
  },
  {
    label: "Tools",
    skills: ["Git", "GitHub", "VSCode", "Antigravity", "Claude Code", "MongoDB"],
  },
];

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Content */}
      <div className="container mx-auto px-6 pt-32 pb-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text */}
          <div className="space-y-8">
            <div className="animate-fade-in">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-primary">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Software Engineer · AI @ Purdue
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl lg:text-6xl font-bold leading-tight animate-fade-in animation-delay-100">
                Building my{" "}
                <span className="text-primary glow-text">future</span>
                <br />
                line-by-line at
                <br />
                <span className="font-serif italic font-normal">
                  Purdue University
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg animate-fade-in animation-delay-200">
                Hi, I'm Adam Zhang - an Artifical Intelliegence major at Purdue
                passionate in robotics and computer vision. I'm working to
                implement AI/ML for physical systems to solve real-world
                problems.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 animate-fade-in animation-delay-300">
              <Button size="lg">
                Contact Me <ArrowRight className="w-5 h-5" />
              </Button>
              <AnimatedBorderButton />
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4 animate-fade-in animation-delay-400">
              <span className="text-sm text-muted-foreground">Connect with me: </span>
              {[
                { icon: Github, href: "https://github.com/adamzhang06" },
                {
                  icon: Linkedin,
                  href: "https://www.linkedin.com/in/adam-zhang-8b2b44382/",
                },
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full glass hover:bg-primary/10 hover:text-primary transition-all duration-300"
                >
                  {<social.icon className="w-5 h-5" />}
                </a>
              ))}
            </div>
          </div>
          {/* Right Column - Profile Image */}
          <div className="relative animate-fade-in animation-delay-300">
            {/* Profile Image */}
            <div className="relative max-w-md mx-auto">
              <div
                className="absolute inset-0
                rounded-3xl bg-gradient-to-br
                from-primary/30 via-transparent
                to-primary/10 blur-2xl animate-pulse"
              />
              <div className="relative glass rounded-3xl p-2 glow-border">
                <img
                  src="/profile-photo.jpeg"
                  alt="Adam Zhang"
                  className="w-full aspect-[4/5] object-cover rounded-2xl"
                />

                {/* Floating Badge */}
                <div className="absolute -bottom-4 -right-4 glass rounded-xl px-4 py-3 animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">
                      Available for work
                    </span>
                  </div>
                </div>
                {/* Stats Badge */}
                <div className="absolute -top-4 -left-4 glass rounded-xl px-4 py-3 animate-float animation-delay-500">
                  <div className="text-2xl font-bold text-primary">'28</div>
                  <div className="text-2s text-muted-foreground">BS in AI</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="mt-20 animate-fade-in animation-delay-600">
          <p className="text-sm text-muted-foreground mb-6 text-center uppercase tracking-widest">
            Technologies I work with
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {skillCategories.map((category) => (
              <div key={category.label} className="glass rounded-2xl p-4">
                <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">
                  {category.label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs px-2 py-1 rounded-full bg-surface/60 text-muted-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 
      animate-fade-in animation-delay-800"
      >
        <a
          href="#about"
          className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
        >
          <span className="text-xs uppercase tracking-wider">Scroll</span>
          <ChevronDown className="w-6 h-6 animate-bounce" />
        </a>
      </div>
    </section>
  );
};
