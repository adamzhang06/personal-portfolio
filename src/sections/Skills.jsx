const skillCategories = [
  {
    label: "Languages",
    skills: ["Python", "Java", "R", "C++", "JavaScript", "HTML/CSS", "SQL", "NoSQL"],
  },
  {
    label: "Frameworks",
    skills: ["React", "ROS 2", "React Native", "FastAPI", "MongoDB", "Tailwind CSS"],
  },
  {
    label: "Libraries",
    skills: ["Pandas", "NumPy", "sklearn", "PyTorch", "TensorFlow", "Keras", "OpenCV", "Matplotlib", "Gymnasium", "Seurat"],
  },
  {
    label: "Tools",
    skills: ["Git", "GitHub", "Claude Code", "VS Code", "Antigravity", "RStudio", "PyCharm", "Android Studio"],
  },
];

export const Skills = () => {
  return (
    <section id="skills" className="py-24">
      <div className="container mx-auto px-6">
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">
            Skills
          </p>
          <h2 className="text-4xl font-bold">Technologies I work with</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {skillCategories.map((category, idx) => (
            <div
              key={category.label}
              className="card-vivid rounded-2xl p-5"
              style={{ "--card-angle": ["120deg", "60deg", "200deg", "30deg"][idx % 4] }}
            >
              <p className="text-sm font-semibold text-foreground uppercase tracking-widest mb-3 text-center">
                {category.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
