import { Paintbrush, Rotate3D, Wrench } from "lucide-react";
import { FEATURES } from "@/lib/site";

const ICONS = {
  wrench: Wrench,
  rotate: Rotate3D,
  paint: Paintbrush,
} as const;

export default function FeaturesSection() {
  return (
    <section className="section wrap" id="about">
      <div className="section-head">
        <h2>
          Доступ к деке
          <br />
          и ножам
        </h2>
        <p>
          Кантователь наклоняет райдер набок, чтобы можно было убрать траву с деки и обслужить ножи
        </p>
      </div>
      <div className="feature-grid">
        <div className="work-photo">
          <img
            src="/images/work.png"
            alt="Кантователь поднимает райдер: доступ к деке и ножам"
            loading="lazy"
          />
          <span>Очистка деки</span>
        </div>
        <div className="feature-list">
          {FEATURES.map((feature) => {
            const Icon = ICONS[feature.icon];
            return (
              <article key={feature.title}>
                <Icon />
                <div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
