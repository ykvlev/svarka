"use client";

import { Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INCLUDED, SITE, SIZES } from "@/lib/site";
import { formatPrice } from "@/lib/format";

export default function OrderSection({
  size,
  onSizeChange,
  onRequest,
}: {
  size: string;
  onSizeChange: (size: string) => void;
  onRequest: () => void;
}) {
  return (
    <section className="section wrap" id="order">
      <div className="order-panel">
        <div>
          <h2>
            Что входит
            <br />
            в комплект
          </h2>
          <p>
            Металлическая конструкция, ручная лебёдка,
            <br />
            колёса, крепёж и порошковая окраска
          </p>
          <ul>
            {INCLUDED.map((item) => (
              <li key={item}>
                <Check size={17} />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="order-choice">
          <span className="small">КОМПЛЕКТ С ДОСТАВКОЙ</span>
          <div className="big-price">
            {formatPrice(SITE.price)} <span>₽</span>
          </div>
          <label htmlFor="order-size">Размер</label>
          <Select value={size} onValueChange={onSizeChange}>
            <SelectTrigger className="size-select" id="order-size">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SIZES.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button className="primary" type="button" onClick={onRequest}>
            Оставить заявку
          </button>
          <p className="small">
            Доставка включена в цену / Нестандартный размер и цвет рассчитаем отдельно
          </p>
        </div>
      </div>
    </section>
  );
}
