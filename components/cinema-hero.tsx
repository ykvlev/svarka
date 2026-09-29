"use client";

import { SITE } from "@/lib/site";
import { formatPrice } from "@/lib/format";

export default function CinemaHero({ onRequest }: { onRequest: () => void }) {
  return (
    <section className="cinema-hero" id="top">
      <div className="cinema-shade" />
      <div className="cinema-copy">
        <h1>
          Кантователь
          <br />
          для садового трактора
        </h1>
        <p>
          Для очистки деки, замены ножей
          <br />
          и обслуживания райдера
        </p>
        <div className="cinema-action">
          <span>
            С доставкой <span className="nowrap">{formatPrice(SITE.price)} ₽</span>
          </span>
          <button className="primary" type="button" onClick={onRequest}>
            Оставить заявку
          </button>
        </div>
      </div>
      <div className="cinema-foot">
        <span>Изготовлено в Великом Новгороде</span>
        <a href="#explore">Посмотреть конструкцию</a>
        <span>{SITE.delivery}</span>
      </div>
    </section>
  );
}
