import { AWARD, EDUCATION, INTERESTS, INTRO } from "@/data/site";
import { skills } from "@/data/skills";
import { cardByKey } from "@/data/cards";
import { CardHead } from "@/components/CardHead";

export function About() {
  return (
    <div className="wrap page">
      <CardHead card={cardByKey("about")} />
      <div className="about-top">
        <div>
          <p>{INTRO}</p>
          <h2>Award</h2>
          <p className="muted">{AWARD}</p>
          <h2>Interests</h2>
          <p className="muted">{INTERESTS}</p>
        </div>
        <section className="edu" aria-labelledby="edu-h">
          <h2 id="edu-h">Education</h2>
          <p className="muted">
            <span className="school">{EDUCATION.school}</span>
            <br />
            {EDUCATION.degree}
            <br />
            {EDUCATION.college}
          </p>
          <p className="muted">{EDUCATION.abroad}</p>
          <p className="muted" style={{ marginBottom: 0 }}>
            Coursework: {EDUCATION.coursework.join(", ")}.
          </p>
        </section>
      </div>
      <section className="skills" aria-labelledby="sk-h">
        <h2 id="sk-h">Skills</h2>
        <div className="skgrid">
          {skills.map((k) => (
            <div key={k.group}>
              <h3>{k.group}</h3>
              <div className="tags">
                {k.items.map((t) => (
                  <span key={t} className="tag">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
