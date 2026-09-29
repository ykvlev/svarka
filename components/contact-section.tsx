import { SITE } from "@/lib/site";

export default function ContactSection() {
  return (
    <section className="contact wrap">
      <div>
        <h2>Связаться с {SITE.ownerInstrumental}</h2>
        <p>
          Пришлите марку и модель райдера
          <br />
          для подбора размера и расчёта заказа
        </p>
      </div>
      <div className="contact-links">
        <a className="contact-phone" href={`tel:${SITE.phone}`}>
          {SITE.phoneDisplay}
        </a>
        <div>
          <a className="ghost" href={SITE.telegram} target="_blank" rel="noreferrer">
            Telegram
          </a>
          <a className="ghost" href={SITE.vk} target="_blank" rel="noreferrer">
            ВКонтакте
          </a>
        </div>
        <span className="small">{SITE.city}</span>
      </div>
    </section>
  );
}
