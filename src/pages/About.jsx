import {
  ABOUT_PHOTOS,
  ABOUT_BLURB,
  AWARDS,
  EDUCATION,
  INTERESTS,
} from "@/data/site";
import { skills } from "@/data/skills";
import { cardByKey } from "@/data/cards";
import { CardHead } from "@/components/CardHead";
import { Rich } from "@/components/Rich";

export function About() {
  return (
    <div className="wrap page">
      <div className="about-top">
        <div>
          <CardHead
            card={cardByKey("about")}
            aside={
              <div className="about-polaroids">
                {ABOUT_PHOTOS.map((p, i) => (
                  <figure key={i} className="mini-polaroid">
                    <img src={p.src} alt={p.alt} width="140" height="140" />
                    {p.caption && <figcaption>{p.caption}</figcaption>}
                  </figure>
                ))}
              </div>
            }
          />
          {ABOUT_BLURB.map((t) => (
            <p key={t} className="blurb">
              <Rich text={t} />
            </p>
          ))}
          <h2>Honors &amp; Awards</h2>
          <ul className="awards">
            {AWARDS.map((a) => (
              <li key={a.title}>
                <div className="aw-main">
                  <span className="aw-title">{a.title}</span>
                  {a.detail && <span className="aw-detail">{a.detail}</span>}
                </div>
                <span className="aw-date note">{a.date}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="about-side">
          <section className="side-sec" aria-labelledby="edu-h">
            <h2 id="edu-h">Education</h2>
            <p className="edu-school">{EDUCATION.school}</p>
            <p className="edu-degree">{EDUCATION.degree}</p>
            <p className="edu-college">{EDUCATION.college}</p>
            <dl className="edu-rows">
              <div>
                <dt className="note">Abroad</dt>
                <dd>{EDUCATION.abroad}</dd>
              </div>
              <div>
                <dt className="note">Coursework</dt>
                <dd className="tags">
                  {EDUCATION.coursework.map((c) => (
                    <span key={c} className="tag">
                      {c}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          </section>
          <section className="side-sec" aria-labelledby="int-h">
            <h2 id="int-h">Interests</h2>
            <div className="tags tags-lg">
              {INTERESTS.map((t) => (
                <span key={t} className="tag">
                  {t}
                </span>
              ))}
            </div>
          </section>
          <section aria-labelledby="sk-h">
            <h2 id="sk-h" className="sk-h">
              Skills
            </h2>
            <div className="skgrid">
              {skills.map((k) => (
                <div key={k.group} className="skbox">
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
      </div>
    </div>
  );
}
